import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    StyleSheet,
    Animated,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { faqPrompt, productInfoPrompt, troubleshootingPrompt, conversationalPrompt, createDeviceTypePrompt, determineQuestionType, appProcessPrompt, ChatbotFirebaseResponse } from './prompts';
import { 
    getChatbotDeviceData, 
    getChatbotEnergyData, 
    getChatbotAutomationData,
    getEnergySavingRecommendations
} from '../../backend/chatbotService';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

interface UserData {
    userId: string | null;
    devices: any[] | null;
    energy: ChatbotFirebaseResponse | null;
    automations: any[] | null;
    recommendations: string[] | null;
}

const Chatbot = () => {
    const [visible, setVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(300)).current;
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [availableModels, setAvailableModels] = useState(null);
    const [userData, setUserData] = useState<UserData>({
        userId: null,
        devices: null,
        energy: null,
        automations: null,
        recommendations: null
    });
    const [dataLoading, setDataLoading] = useState(false);

    const API_KEY = 'AIzaSyDvIqoJJ1eEBomjDsw5SvfnhRkm6XLyO5E'; // Replace with your actual API key - DANGER!
    const genAI = new GoogleGenerativeAI(API_KEY);
    const auth = getAuth();

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User is authenticated:", user.uid);
                setUserData(prev => ({ ...prev, userId: user.uid }));
                // Don't load data immediately, only when the chatbot is opened
            } else {
                console.log("User is not authenticated");
                setUserData({
                    userId: null,
                    devices: null,
                    energy: null,
                    automations: null,
                    recommendations: null
                });
            }
        });

        return () => unsubscribe();
    }, []);

    // Load user data when chatbot becomes visible and user is authenticated
    useEffect(() => {
        const loadUserData = async () => {
            if (visible && userData.userId) {
                try {
                    setDataLoading(true);
                    console.log("Loading user data for chatbot...");
                    
                    // Fetch data in parallel
                    const [deviceData, energyData, automationData, recommendationsData] = await Promise.all([
                        getChatbotDeviceData(userData.userId),
                        getChatbotEnergyData(userData.userId),
                        getChatbotAutomationData(userData.userId),
                        getEnergySavingRecommendations(userData.userId)
                    ]) as [ChatbotFirebaseResponse, ChatbotFirebaseResponse, ChatbotFirebaseResponse, ChatbotFirebaseResponse];
                    
                    if (deviceData.success && deviceData.count !== undefined) {
                        console.log("Device data loaded:", deviceData.count, "devices");
                    }
                    
                    setUserData(prev => ({
                        ...prev,
                        devices: deviceData.success && deviceData.devices ? deviceData.devices : [],
                        energy: energyData.success ? energyData : null,
                        automations: automationData.success && automationData.automations ? automationData.automations : [],
                        recommendations: recommendationsData.success && recommendationsData.recommendations ? recommendationsData.recommendations : []
                    }));
                    
                    // Automatically welcome the user with their data summary when opening
                    if (deviceData.success && messages.length === 0 && deviceData.devices) {
                        const deviceCount = deviceData.devices.length;
                        const automationCount = automationData.success && automationData.automations ? automationData.automations.length : 0;
                        
                        let welcomeMessage = `Welcome back! `;
                        
                        if (deviceCount > 0) {
                            welcomeMessage += `You have ${deviceCount} device${deviceCount !== 1 ? 's' : ''} connected. `;
                            
                            // Add energy info if available
                            if (energyData.success && energyData.totalEnergy && energyData.totalEnergy > 0) {
                                welcomeMessage += `Your total energy usage is ${Math.round(energyData.totalEnergy)} Wh. `;
                            }
                            
                            // Add automation info if available
                            if (automationCount > 0) {
                                welcomeMessage += `You have ${automationCount} automation${automationCount !== 1 ? 's' : ''} set up. `;
                            }
                            
                            welcomeMessage += `How can I help you today?`;
                        } else {
                            welcomeMessage += `You don't have any devices set up yet. Would you like help adding your first device?`;
                        }
                        
                        setMessages([{
                            id: Date.now().toString(),
                            text: welcomeMessage,
                            sender: 'bot'
                        }]);
                    }
                } catch (error) {
                    console.error("Error loading user data for chatbot:", error);
                } finally {
                    setDataLoading(false);
                }
            }
        };

        loadUserData();
    }, [visible, userData.userId]);

    useEffect(() => {
        const listModels = async () => {
            try {
                // The GoogleGenerativeAI API might have changed, we'll skip trying to list models
                // and just continue with the chatbot functionality
                console.log("Initializing chatbot model...");
                // setAvailableModels(models);
            } catch (error) {
                console.error("Error initializing chatbot:", error);
            }
        };

        listModels();
    }, []);

    const toggleChat = () => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setVisible(false));
        } else {
            setVisible(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    // Create a context object with user data for enhanced prompts
    const createUserContext = () => {
        let context = "";
        
        // Add device information if available
        if (userData.devices && userData.devices.length > 0) {
            context += "\nUSER'S DEVICES:\n";
            userData.devices.forEach((device, index) => {
                context += `${index + 1}. ${device.name} (${device.type}) - ${device.isOn ? 'ON' : 'OFF'}\n`;
                context += `   Location: ${device.location}\n`;
                context += `   Energy: ${device.totalEnergy} Wh\n`;
                
                // Add device-specific settings if they exist
                if (device.settings && Object.keys(device.settings).length > 0) {
                    context += `   Settings: ${JSON.stringify(device.settings)}\n`;
                }
            });
        }
        
        // Add energy information if available
        if (userData.energy && userData.energy.totalEnergy !== undefined) {
            context += "\nUSER'S ENERGY USAGE:\n";
            context += `Total energy: ${userData.energy.totalEnergy} Wh\n`;
            
            if (userData.energy.energyByType && userData.energy.energyByType.length > 0) {
                context += "Energy by device type:\n";
                userData.energy.energyByType.forEach((item: {type: string, energy: number}) => {
                    context += `- ${item.type}: ${item.energy} Wh\n`;
                });
            }
        }
        
        // Add automation information if available
        if (userData.automations && userData.automations.length > 0) {
            context += "\nUSER'S AUTOMATIONS:\n";
            userData.automations.forEach((automation, index) => {
                context += `${index + 1}. ${automation.name}\n`;
                context += `   Trigger: ${automation.trigger}\n`;
                context += `   Action: ${automation.actions}\n`;
                context += `   Status: ${automation.isActive ? 'Active' : 'Inactive'}\n`;
                
                if (automation.devices && automation.devices.length > 0) {
                    const deviceNames = automation.devices.map((d: {name: string}) => d.name).join(', ');
                    context += `   Devices: ${deviceNames}\n`;
                }
            });
        }
        
        // Add energy-saving recommendations if available
        if (userData.recommendations && userData.recommendations.length > 0) {
            context += "\nRECOMMENDATIONS FOR USER:\n";
            userData.recommendations.forEach((rec, index) => {
                context += `${index + 1}. ${rec}\n`;
            });
        }
        
        return context;
    };

    const sendMessage = async () => {
        const trimmedInput = input.trim();

        if (!trimmedInput || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: trimmedInput,
            sender: 'user',
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const questionType = determineQuestionType(trimmedInput);
            let fullPrompt = '';
            
            // Get user context for more personalized responses
            const userContext = createUserContext();

            switch(questionType) {
              case 'faq':
                  fullPrompt = `${faqPrompt}${userContext}\n\nUSER QUESTION: ${trimmedInput}`;
                  break;
              case 'product_info':
                  // Check if we need a more specific device prompt
                  if (trimmedInput.toLowerCase().includes('thermostat')) {
                      fullPrompt = `${createDeviceTypePrompt('thermostat')}${userContext}\n\nUSER QUESTION: ${trimmedInput}`;
                  } else if (trimmedInput.toLowerCase().includes('light')) {
                      fullPrompt = `${createDeviceTypePrompt('lighting')}${userContext}\n\nUSER QUESTION: ${trimmedInput}`;
                  } else {
                      fullPrompt = `${productInfoPrompt}${userContext}\n\nUSER QUESTION: ${trimmedInput}`;
                  }
                  break;
              case 'troubleshooting':
                  fullPrompt = `${troubleshootingPrompt}${userContext}\n\nUSER QUESTION: ${trimmedInput}`;
                  break;
              case 'app_process':
                  fullPrompt = `${appProcessPrompt}${userContext}\n\nUSER QUESTION: ${trimmedInput}`;
                  break;
              default:
                  // Handle casual conversation
                  fullPrompt = `${conversationalPrompt}${userContext}\n\nUSER QUESTION: ${trimmedInput}`;
          }

            const result = await model.generateContent(fullPrompt);

            if (!result || !result.response) {
                throw new Error("No response received from the Gemini API.");
            }

            const text = result.response.text();

            if (!text) {
                throw new Error("Empty response from Gemini API.");
            }

            const botMessage: Message = {
                id: Date.now().toString(),
                text,
                sender: 'bot',
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error fetching response:', error);
            console.error("Error Details:", JSON.stringify(error, null, 2));

            let errorMessage = 'Sorry, I encountered an error. Please try again.';

            if (error instanceof Error) {
                errorMessage = `Sorry, I encountered an error: ${error.message}`;
            }

            const errorBotMessage: Message = {
                id: Date.now().toString(),
                text: errorMessage,
                sender: 'bot',
            };

            setMessages((prev) => [...prev, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {!visible && (<TouchableOpacity style={styles.floatingButton} onPress={toggleChat}>
                <Ionicons name="chatbubble-ellipses" size={24} color="white" />
            </TouchableOpacity>
)}

            {visible && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    style={styles.keyboardAvoidingContainer}
                >
                  <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={toggleChat}
                  />
                    <Animated.View
                        style={[styles.chatContainer, { transform: [{ translateX: slideAnim }] }]}
                    >
                        <View style={styles.header}>
                            <Text style={styles.headerText}>Watt-E, your personal chatbot</Text>
                            <TouchableOpacity onPress={toggleChat}>
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        {dataLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#001322" />
                                <Text style={styles.loadingText}>Loading your data...</Text>
                            </View>
                        )}

                        <FlatList
                            data={messages}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View
                                    style={[styles.message, item.sender === 'user' ? styles.userMessage : styles.botMessage]}
                                >
                                    <Text style={styles.messageText}>{item.text}</Text>
                                </View>
                            )}
                            style={styles.messageList}
                            inverted={false}
                            contentContainerStyle={styles.messagesContentContainer}
                        />

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, { maxHeight: 100 }]}
                                placeholder="Type a message..."
                                value={input}
                                onChangeText={setInput}
                                multiline={Platform.OS === 'ios'}
                            />
                            <TouchableOpacity 
                                style={styles.sendButton} 
                                onPress={sendMessage}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#001322" />
                                ) : (
                                    <Ionicons name="send" size={24} color="#001322" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {availableModels && (
                            <ScrollView style={styles.modelListContainer}>
                                <Text style={styles.modelListTitle}>Available Models:</Text>
                                {availableModels.map((model) => (
                                    <View key={model.name} style={styles.modelListItem}>
                                        <Text style={styles.modelListItemName}>{model.name}</Text>
                                        <Text>Description: {model.description}</Text>
                                        <Text>Supported Methods: {model.supportedGenerationMethods.join(', ')}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </Animated.View>
                </KeyboardAvoidingView>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    floatingButton: {
      position: Platform.OS === 'web' ? "fixed" : "absolute",
      bottom: 23,
      backgroundColor: "#001322",
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: "#ccc",
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      right: Platform.OS === 'ios' ? 14 : 20,
      marginBottom: Platform.OS === 'ios' ? 58 : 0,
      zIndex: 2000, // Make sure it's above everything else
    },
    chatContainer: {
      position: Platform.OS === 'web' ? "fixed" : "absolute",
      right: 0,
      top: 0,
      bottom: Platform.OS === 'ios' ? 80 : 0,
      width: Platform.OS === 'ios' ? "80%" : "30%",
      backgroundColor: "white",
      borderLeftWidth: 1,
      borderColor: "#ccc",
      padding: 15,
      paddingLeft: 20,
      paddingBottom: Platform.OS === 'ios' ? 20 : 20,
      shadowColor: "#000",
      shadowOffset: { width: -4, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 25,
      zIndex: 2000, // Make sure it's above everything else
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      paddingBottom: 5,
      marginBottom: 5,
    },
    headerText: {
      fontSize: 18,
      fontWeight: "bold",
    },
    message: {
      padding: 10,
      marginVertical: 5,
      borderRadius: 10,
      maxWidth: "80%",
    },
    userMessage: {
      alignSelf: "flex-end",
      backgroundColor: "#3d62d1",
    },
    botMessage: {
      alignSelf: "flex-start",
      backgroundColor: "#001322",
    },
    messageText: {
      color: "white",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: "#ccc",
      paddingTop: 5,
      paddingRight: 5,
      marginTop: 5,
    },
    input: {
      flex: 1,
      padding: 8,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
    },
    sendButton: {
      padding: 10,
      marginLeft: 8,
    },   
    modelListContainer: {
        marginTop: 10,
        maxHeight: 150, // Adjust as needed
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 10,
    },
    modelListTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    modelListItem: {
        marginBottom: 5,
        padding: 5,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 3,
    },
    modelListItemName: {
        fontWeight: '500',
    },
    keyboardAvoidingContainer: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: "100%",
      height: "100%",
      zIndex: 1000,
    },
    messageList: {
        flex: 1,
    },
    messagesContentContainer: {
        paddingBottom: 10,
        flexGrow: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)', 
        zIndex: 900,
    },
    loadingContainer: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 5,
        fontSize: 14,
        color: '#001322',
    }
});

export default Chatbot;