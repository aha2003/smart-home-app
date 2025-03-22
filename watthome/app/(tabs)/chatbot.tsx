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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { faqPrompt, productInfoPrompt, troubleshootingPrompt, conversationalPrompt, createDeviceTypePrompt, determineQuestionType, appProcessPrompt } from './prompts';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

const Chatbot = () => {
    const [visible, setVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(300)).current;
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [availableModels, setAvailableModels] = useState(null);

    const API_KEY = 'AIzaSyDvIqoJJ1eEBomjDsw5SvfnhRkm6XLyO5E'; // Replace with your actual API key - DANGER!
    const genAI = new GoogleGenerativeAI(API_KEY);

    useEffect(() => {
        const listModels = async () => {
            try {
              const models = await genAI.listModels();
                // setAvailableModels(models);
            } catch (error) {
                console.error("Error listing models:", error);
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

    const sendMessage = async () => {
        const trimmedInput = input.trim();

        if (!trimmedInput || isLoading) return;

        const userMessage = {
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

            switch(questionType) {
              case 'faq':
                  fullPrompt = `${faqPrompt}${trimmedInput}`;
                  break;
              case 'product_info':
                  // Check if we need a more specific device prompt
                  if (trimmedInput.toLowerCase().includes('thermostat')) {
                      fullPrompt = `${createDeviceTypePrompt('thermostat')}${trimmedInput}`;
                  } else if (trimmedInput.toLowerCase().includes('light')) {
                      fullPrompt = `${createDeviceTypePrompt('lighting')}${trimmedInput}`;
                  } else {
                      fullPrompt = `${productInfoPrompt}${trimmedInput}`;
                  }
                  break;
              case 'troubleshooting':
                  fullPrompt = `${troubleshootingPrompt}${trimmedInput}`;
                  break;
              case 'app_process':
                  fullPrompt = `${appProcessPrompt}${trimmedInput}`;
                  break;
              default:
                  // Handle casual conversation
                  fullPrompt = `${conversationalPrompt}${trimmedInput}`;
          }

            const result = await model.generateContent(fullPrompt);

            if (!result || !result.response) {
                throw new Error("No response received from the Gemini API.");
            }

            const text = result.response.text();

            if (!text) {
                throw new Error("Empty response from Gemini API.");
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text,
                    sender: 'bot',
                },
            ]);
        } catch (error) {
            console.error('Error fetching response:', error);
            console.error("Error Details:", JSON.stringify(error, null, 2));

            let errorMessage = 'Sorry, I encountered an error. Please try again.';

            if (error instanceof Error) {
                errorMessage = `Sorry, I encountered an error: ${error.message}`;
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text: errorMessage,
                    sender: 'bot',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // const determineQuestionType = (message: string): string => {
    //     // Basic keyword matching (improve this later with a machine learning classifier)
    //     const messageLower = message.toLowerCase();

    //     if (messageLower.includes('password') || messageLower.includes('reset') || messageLower.includes('login')) {
    //       return 'faq';
    //     } else if (messageLower.includes('thermostat') || messageLower.includes('lightbulb') || messageLower.includes('price')) {
    //       return 'product_info';
    //     } else if (messageLower.includes('connect') || messageLower.includes('not working') || messageLower.includes('error')) {
    //       return 'troubleshooting';
    //     }
    //      else if (messageLower.includes('add') || messageLower.includes('device') ) {
    //       return 'app_process';
    //     }

    //     return 'default'; // Or a generic "I don't understand" prompt
    //   };

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
                            <Text style={styles.headerText}>Watt-E</Text>
                            <TouchableOpacity onPress={toggleChat}>
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

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
                            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                                <Ionicons name="send" size={24} color="#001322" />
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
    // ... (rest of your styles)

    // floatingButton: {
    //   position: "absolute",
    //   bottom: 23,
    //   backgroundColor: "#001322",
    //   width: 60,
    //   height: 60,
    //   borderRadius: 30,
    //   borderWidth: 1,
    //   borderColor: "#ccc",
    //   justifyContent: "center",
    //   alignItems: "center",
    //   elevation: 5,
    //   right: Platform.OS === 'ios' ? 14 : 20,
    //   marginBottom: Platform.OS === 'ios' ? 58 : 0,
    // },
    floatingButton: {
      // position: "fixed", // Change to fixed for web
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
    // Update chatContainer style:
    chatContainer: {
      // position: "fixed", // Change to fixed for web
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
    // chatContainer: {
    //   position: "absolute",
    //   right: 0,
    //   top: 0,
    //   bottom: Platform.OS === 'ios' ? 80 : 0,
    //   width: Platform.OS === 'ios' ? "80%" : "30%",
    //   backgroundColor: "white",
    //   borderLeftWidth: 1,
    //   borderColor: "#ccc",
    //   padding: 15,
    //   paddingLeft: 20,
    //   paddingBottom: Platform.OS === 'ios' ? 20 : 20,
    //   shadowColor: "#000",
    //   shadowOffset: { width: -4, height: 0 },
    //   shadowOpacity: 0.2,
    //   shadowRadius: 25,
    // },
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
      //padding: 10,
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
//   // ...StyleSheet.absoluteFillObject,
//   // backgroundColor: 'rgba(0,0,0,0.5)', 
//   position: 'absolute',
//   top: 0,
//   bottom: 100,
//   right: Platform.OS === 'ios' ? "80%" : "30%", // match chatContainer width
//   left: 0,
//   backgroundColor: 'rgba(0,0,0,0.5)',
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', 
    zIndex: 900,
}
});

export default Chatbot;