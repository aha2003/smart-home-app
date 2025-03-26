import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform, Switch, TextInput, ScrollView, KeyboardAvoidingView, Alert, LogBox, RefreshControl } from 'react-native';
import { Sun, Moon, Clock, Power, Plus, Thermometer, CreditCard as Edit, X, Check, RefreshCw } from 'lucide-react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from "./LoginStyles";
import Chatbot from './chatbot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

// Firebase imports
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../backend/firebaseConfig';
import { 
  getUserAutomations, 
  createAutomation,
  updateAutomation,
  deleteAutomation as deleteAutomationInFirebase,
  toggleAutomationActive,
  checkTimeBasedAutomations,
  checkTemperatureBasedAutomations,
  startAutomationSystem,
  stopAutomationSystem,
  forceCheckAutomation
} from '../../backend/automationService';
import { getUserDevices } from '../../backend/deviceService';

// Ignore specific warnings
LogBox.ignoreLogs([
  "TypeError: genAI.listModels is not a function",
  "Setting a timer"
]);

// Type definitions
interface DeviceType {
  id: string | number;
  name?: string;
  deviceName?: string;
  location: string;
  deviceType?: string;
  isOn?: boolean;
  settings?: any;
  icon?: string;
}

interface AutomationType {
  id: string;
  name: string;
  userId?: string;
  trigger: string;
  triggerTime?: string;
  triggerValue?: string;
  triggerDevice?: DeviceType; // Device that acts as the sensor for temperature triggers
  devices: any[]; // Keep flexible since device format varies
  actions: string;
  actionValue: string;
  frequency?: string;
  isActive: boolean;
  lastTriggered?: Date;
  notifyBefore?: boolean;
  isAddCard?: boolean;
}

// Special type for the "Add" card
interface AddCardType {
  id: string;
  isAddCard: boolean;
}

// Union type for FlatList items
type AutomationListItem = AutomationType | AddCardType;

interface AutomationResponse {
  success: boolean;
  automations?: AutomationType[];
  message?: string;
  count?: number;
  executed?: boolean;
}

interface TimerType {
  timeChecker?: NodeJS.Timeout;
  temperatureChecker?: NodeJS.Timeout;
}

const NavBar = () => {
  const isDesktop = Platform.OS === 'web';

  return (
    <View style={[styles.navBar, isDesktop ? styles.desktopNav : styles.mobileNav]}>
      <Link href="/home" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="home-outline" 
            size={45} 
            color="white" 
          />
        </TouchableOpacity>
      </Link>

      <Link href="/devices" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="devices" 
            size={46} 
            color="white"
          />
        </TouchableOpacity>
      </Link>

      <Link href="/energy" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="lightning-bolt" 
            size={38} 
            color="white"
          />
        </TouchableOpacity>
      </Link>

      <Link href="/automation" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="robot-industrial" 
            size={35} 
            color="white"
            style={styles.glowIcon}
          />
        </TouchableOpacity>
      </Link>

      <Link href="/settings" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="cog" 
            size={35} 
            color="white"
          />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

// Helper function to format time
const formatTime = (timeString: string | number | undefined): string => {
  if (!timeString) return '';
  return String(timeString);
};

// Available devices for selection
const availableDevices = [
  { id: 1, name: 'Smart Light', location: 'Living Room', icon: 'lightbulb-outline' },
  { id: 2, name: 'Thermostat', location: 'Living Room', icon: 'thermometer' },
  { id: 3, name: 'CCTV', location: 'Front Door', icon: 'cctv' },
  { id: 4, name: 'TV', location: 'Living Room', icon: 'television' },
  { id: 5, name: 'Smart Light', location: 'Bedroom', icon: 'lightbulb-outline' },
  { id: 6, name: 'Thermostat', location: 'Bedroom', icon: 'thermometer' },
  { id: 7, name: 'CCTV', location: 'Garage Door', icon: 'cctv' },
  { id: 8, name: 'Roomba', location: 'Kitchen', icon: 'robot-vacuum' },
  { id: 9, name: 'Smart Light', location: 'Kitchen', icon: 'lightbulb-outline' },
  { id: 10, name: 'Thermostat', location: 'Kitchen', icon: 'thermometer' },
  { id: 11, name: 'Washing Machine', location: 'Kitchen', icon: 'washing-machine' },
  { id: 12, name: 'Pill Dispenser', location: 'Grandpa Room', icon: 'pill' },
  { id: 13, name: 'Thermostat', location: 'Grandma Room', icon: 'thermometer' },
  { id: 14, name: 'Smart Light', location: 'Grandma Room', icon: 'lightbulb-outline' },
  { id: 15, name: 'Thermostat', location: 'Kids Room', icon: 'thermometer' },
  { id: 16, name: 'Smart Light', location: 'Kids Room', icon: 'lightbulb-outline' },
];

// Helper function to format trigger text for display
const formatTriggerText = (trigger: string, triggerTime?: string, triggerValue?: string, triggerDevice?: any): string => {
  if (trigger === 'Time of Day' && triggerTime) {
    return `At ${triggerTime}`;
  } else if (trigger.startsWith('Temperature')) {
    const comparison = trigger.split(' ')[1] || '';
    const sensorName = triggerDevice ? ` (${triggerDevice.name || triggerDevice.deviceName})` : '';
    return `When Temperature ${comparison} ${triggerValue || ''}°C${sensorName}`;
  }
  return trigger;
};

export default function AutomationsScreen() {
  const [automations, setAutomations] = useState<AutomationType[]>([]);
  const [devices, setDevices] = useState<DeviceType[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationType | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [automationTimers, setAutomationTimers] = useState<TimerType>({});
  const [refreshing, setRefreshing] = useState(false);

  // New automation form state
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger: '',
    timeInput: '12:00',
    timePeriod: 'AM',
    triggerValue: '',
    temperatureComparison: 'Above', // Default temperature comparison
    triggerDevice: null as DeviceType | null, // Device that will act as the temperature sensor
    devices: [] as any[],
    actions: '',
    actionValue: '',
  });

  const triggerOptions = [
    { label: 'Time of Day', value: 'Time of Day' },
    { label: 'Temperature', value: 'Temperature' },
  ];

  const temperatureComparisonOptions = [
    { label: 'Above', value: 'Above' },
    { label: 'Below', value: 'Below' },
  ];

  const actionOptions = [
    { label: 'Turn On', value: 'Turn On' },
    { label: 'Turn Off', value: 'Turn Off' },
    { label: 'Set Temperature', value: 'Set Temperature' },
    { label: 'Set Brightness', value: 'Set Brightness' },
  ];

  // Default automations
const defaultAutomations = [
  {
    id: 'auto_1',
    name: 'Morning Lights',
    trigger: 'Time of Day',
    triggerTime: '07:00 AM',
    triggerValue: '',
    devices: [
      { id: 1, name: 'Smart Light', location: 'Living Room', icon: 'lightbulb-outline' },
      { id: 5, name: 'Smart Light', location: 'Bedroom', icon: 'lightbulb-outline' },
    ],
    actions: 'Turn On',
    actionValue: '',
    isActive: true,
    notifyBefore: false,
    frequency: 'Daily',
  },
  {
    id: 'auto_2',
    name: 'Night Mode',
    trigger: 'Time of Day',
    triggerTime: '10:00 PM',
    triggerValue: '',
    devices: [
      { id: 1, name: 'Smart Light', location: 'Living Room', icon: 'lightbulb-outline' },
      { id: 5, name: 'Smart Light', location: 'Bedroom', icon: 'lightbulb-outline' },
      { id: 6, name: 'Thermostat', location: 'Bedroom', icon: 'thermometer' },
    ],
    actions: 'Turn Off',
    actionValue: '',
    isActive: true,
    notifyBefore: false,
    frequency: 'Daily',
  },
];

// Firebase authentication
useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      setUserId(user.uid);
      console.log("User authenticated:", user.uid);
      loadUserDevices(user.uid);
      loadAutomations(user.uid);
      setupClientSideAutomations(user.uid);
    } else {
      // User is signed out
      setUserId(null);
      setAutomations([]);
      setDevices([]);
      setIsLoading(false);
    }
  });
  
  // Clean up on unmount
  return () => {
    unsubscribe();
    stopAutomationSystem();
  };
}, []);

// Set up client-side automation checking
const setupClientSideAutomations = (uid: string) => {
  console.log("Setting up client-side automation timers");
  
  // Clear any existing timers
  if (automationTimers.timeChecker) {
    clearInterval(automationTimers.timeChecker);
  }
  if (automationTimers.temperatureChecker) {
    clearInterval(automationTimers.temperatureChecker);
  }
  
  // Start the automation system from the service
  const result = startAutomationSystem(uid);
  console.log("Automation system started:", result);
  
  // Clean up function for component unmount
  return () => {
    console.log("Stopping automation system...");
    stopAutomationSystem();
  };
};

// Load user devices from Firebase
const loadUserDevices = async (uid: string) => {
  try {
    const userDevices = await getUserDevices(uid);
    if (userDevices && userDevices.length > 0) {
      // Map the devices to match the expected format
      const formattedDevices = userDevices.map((device: DeviceType) => ({
        id: device.id,
        name: device.deviceName,
        location: device.location,
        deviceType: device.deviceType,
        icon: getIconForDeviceType(device.deviceType),
        isOn: typeof device.isOn === 'boolean' 
          ? device.isOn 
          : device.isOn === 'true' || device.isOn === true,
        settings: device.settings || {}
      }));
      setDevices(formattedDevices);
      } else {
      // Fallback to default devices if none are found
      setDevices(availableDevices);
      }
    } catch (error) {
    console.error("Error loading devices:", error);
    setDevices(availableDevices);
  }
};

// Helper function to get icon for device type
const getIconForDeviceType = (deviceType: string | undefined): string => {
  if (!deviceType) return 'devices';
  
  switch (deviceType) {
    case 'Smart Light': return 'lightbulb-outline';
    case 'Thermostat': return 'thermometer';
    case 'CCTV': return 'cctv';
    case 'TV': return 'television';
    case 'Roomba': return 'robot-vacuum';
    case 'Washing Machine': return 'washing-machine';
    default: return 'devices';
  }
};

// Load automations from Firebase
const loadAutomations = async (uid: string) => {
  setIsLoading(true);
  try {
    console.log("Loading automations for user:", uid);
    const result: any = await getUserAutomations(uid);
    
    console.log("Automation load result:", JSON.stringify(result, null, 2));
    
    if (result && result.success && result.automations && result.automations.length > 0) {
      console.log(`Found ${result.automations.length} automations`);
      setAutomations(result.automations);
    } else {
      console.log('No automations found, using defaults. Result:', result);
      
      // Only attempt to create defaults if we have devices
      if (devices.length === 0) {
        // Load user devices first if not loaded
        await loadUserDevices(uid);
      }
      
      // Create default automations for new users
      console.log("Attempting to create default automations with user devices");
      for (const automation of defaultAutomations) {
        try {
          // Map the devices based on type - for example, find user's smart lights for light-based automations
          const mappedDevices = automation.devices.map(defaultDevice => {
            // Find a matching user device of the same type
            const matchingUserDevice = devices.find(d => 
              (d.deviceType || d.name) === defaultDevice.name
            );
            
            if (matchingUserDevice) {
              return {
                id: matchingUserDevice.id,
                name: matchingUserDevice.deviceName || matchingUserDevice.name,
                location: matchingUserDevice.location,
                deviceType: matchingUserDevice.deviceType || matchingUserDevice.name
              };
            }
            
            // Fall back to the default device if no match
            return defaultDevice;
          });
          
          const createResult = await createAutomation(
            uid,
            automation.name,
            automation.trigger,
            automation.triggerTime || undefined,
            automation.triggerValue || undefined,
            mappedDevices, // Use mapped devices instead of default ones
            automation.actions || undefined,
            automation.actionValue || undefined,
            'Daily',
            false
          );
          console.log("Default automation creation result:", createResult);
        } catch (createError: any) {
          console.error("Error creating default automation:", createError?.message || createError);
        }
      }
      
      // Fetch again to get the created automations with proper IDs
      console.log("Refreshing automations after creating defaults");
      const refreshResult: any = await getUserAutomations(uid);
      if (refreshResult && refreshResult.success && refreshResult.automations) {
        setAutomations(refreshResult.automations);
      }
    }
  } catch (error) {
    console.error("Error loading automations:", error);
    // Only use defaults if we can't get from Firebase
    setAutomations(defaultAutomations);
  } finally {
    setIsLoading(false);
  }
};

  // useEffect(() => {
  //   const loadAutomations = async () => {
  //     try {
  //       const storedAutomations = await AsyncStorage.getItem('automations');
  //       if (storedAutomations) {
  //         setAutomations(JSON.parse(storedAutomations));
  //       }
  //     } catch (error) {
  //       console.error('Error loading automations from AsyncStorage:', error);
  //     }
  //   };

  //   loadAutomations();
  // }, []);

  const createNewAutomation = async () => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to create automations");
      return;
    }

    if (!newAutomation.name || !newAutomation.trigger || newAutomation.devices.length === 0 || !newAutomation.actions) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      // Format time properly
      let triggerTime: string | undefined = undefined;  // Use undefined, not null
      let triggerValue = newAutomation.triggerValue || undefined;  // Use undefined, not null
      let actualTrigger = newAutomation.trigger;
      let triggerDevice = undefined;
      
    if (newAutomation.trigger === 'Time of Day') {
        // Convert 12hr format to proper format if needed
        triggerTime = `${newAutomation.timeInput} ${newAutomation.timePeriod}`;
      } else if (newAutomation.trigger === 'Temperature') {
        // Create the proper trigger name based on the comparison
        actualTrigger = `Temperature ${newAutomation.temperatureComparison}`;
        // Don't set triggerTime for temperature triggers, leave it as undefined
        
        // Validate temperature input
        if (!triggerValue || isNaN(parseFloat(triggerValue))) {
          Alert.alert("Error", "Please enter a valid temperature value");
        return;
      }
        
        // Validate that a trigger device (thermostat) is selected
        if (!newAutomation.triggerDevice) {
          Alert.alert(
            "Error",
            "Please select a thermostat device to use as the temperature sensor"
          );
          return;
        }
        
        // Set the trigger device for the automation
        triggerDevice = {
          id: newAutomation.triggerDevice.id,
          name: newAutomation.triggerDevice.name || newAutomation.triggerDevice.deviceName,
          location: newAutomation.triggerDevice.location,
          deviceType: newAutomation.triggerDevice.deviceType
        };
        
        // Check if at least one device is selected for the action
        if (newAutomation.devices.length === 0) {
          Alert.alert(
            "Error", 
            "Please select at least one device to control with this automation."
          );
          return;
        }
      }

      console.log("Creating automation with parameters:", {
        userId,
      name: newAutomation.name,
        trigger: actualTrigger,
        triggerTime,
        triggerValue,
        triggerDevice,
      devices: newAutomation.devices,
      actions: newAutomation.actions,
        actionValue: newAutomation.actionValue
      });

      // Create automation in Firebase
      const automationData = {
        userId,
        name: newAutomation.name,
        trigger: actualTrigger,
        triggerTime,
        triggerValue,
        devices: newAutomation.devices,
        actions: newAutomation.actions,
        actionValue: newAutomation.actionValue || undefined,
      frequency: 'Daily',
        notifyBefore: false,
        triggerDevice
      };

      console.log("Creating automation with parameters:", automationData);
      
      const result = await createAutomation(
        automationData.userId,
        automationData.name,
        automationData.trigger,
        automationData.triggerTime,
        automationData.triggerValue,
        automationData.devices,
        automationData.actions,
        automationData.actionValue,
        automationData.frequency,
        automationData.notifyBefore,
        automationData.triggerDevice
      );

      console.log("Automation creation result:", result);

      if (result && result.success) {
        // Reload automations to get the most up-to-date list with IDs
        loadAutomations(userId);
        
        // Reset form and close modal
    setNewAutomation({
      name: '',
      trigger: '',
      timeInput: '12:00',
          timePeriod: 'AM',
      triggerValue: '',
          temperatureComparison: 'Above',
          triggerDevice: null,
      devices: [],
      actions: '',
      actionValue: '',
    });
        setAddModalVisible(false);
        
        Alert.alert("Success", "Automation created successfully");
      } else {
        Alert.alert("Error", result.error || "Failed to create automation");
      }
    } catch (error: any) {
      console.error("Error creating automation:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    }
  };

  // Toggle automation active state
  const toggleAutomation = async (automationId: string) => {
    try {
      // Find the automation in local state
      const automation = automations.find(a => a.id === automationId);
      if (!automation) return;
      
      // Toggle isActive state
      const newIsActive = !automation.isActive;
      
      // Update in Firebase
      const result = await toggleAutomationActive(automationId, newIsActive);
      if (result.success) {
        // Update local state
        setAutomations(automations.map(a => 
          a.id === automationId ? { ...a, isActive: newIsActive } : a
        ));
        
        // Show feedback to user
        Alert.alert(
          "Automation Updated",
          `Automation ${newIsActive ? 'activated' : 'deactivated'} successfully.`,
          [{ text: "OK" }]
        );
      } else {
        console.error("Error toggling automation:", result.error);
        Alert.alert(
          "Error",
          "Failed to update automation. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error toggling automation:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Delete an automation
  const handleDeleteAutomation = async (id: string) => {
    try {
      console.log(`Starting deletion of automation ${id} from Firestore...`);
      
      // Call Firebase to delete the automation
      const result = await deleteAutomationInFirebase(id);
      console.log(`Deletion API result:`, result);
      
      if (result && result.success) {
        // Update local state only after successful deletion
        console.log(`Successfully deleted automation ${id} from Firestore, updating local state`);
    setAutomations(automations.filter(auto => auto.id !== id));
        setDetailsModalVisible(false); // Close modal if open
        
        // Show success message
        Alert.alert(
          "Automation Deleted",
          "The automation has been successfully deleted.",
          [{ text: "OK" }]
        );
      } else {
        console.error("Failed to delete automation:", result?.error || "Unknown error");
        Alert.alert(
          "Error",
          "Failed to delete the automation. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while deleting the automation.",
        [{ text: "OK" }]
      );
    }
  };

  const toggleDeviceSelection = (device) => {
    const isSelected = newAutomation.devices.some(d => d.id === device.id);
    setNewAutomation({
      ...newAutomation,
      devices: isSelected
        ? newAutomation.devices.filter(d => d.id !== device.id)
        : [...newAutomation.devices, device],
    });
  };

  const renderDeviceItem = (device) => (
    <TouchableOpacity
      key={device.id}
      style={[
        local_styles.deviceSelectionItem,
        newAutomation.devices.some(d => d.id === device.id) && local_styles.deviceSelectionItemSelected
      ]}
      onPress={() => toggleDeviceSelection(device)}
    >
      <MaterialCommunityIcons name={device.icon} size={24} color="#666" />
      <View style={local_styles.deviceSelectionInfo}>
        <Text style={local_styles.deviceSelectionName}>{device.name}</Text>
        <Text style={local_styles.deviceSelectionLocation}>{device.location}</Text>
      </View>
      {newAutomation.devices.some(d => d.id === device.id) && (
        <Check size={20} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  const renderAddModal = () => (
    <Modal
      visible={addModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setAddModalVisible(false)}
    >
      <View style={local_styles.modalOverlay}>
        <View style={local_styles.addModalContainer}>
          <View style={local_styles.modalHeader}>
            <Text style={local_styles.modalTitle}>New Automation</Text>
            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={local_styles.addModalContent}>
            <Text style={local_styles.inputLabel}>Name</Text>
            <TextInput
              style={local_styles.input}
              value={newAutomation.name}
              onChangeText={(text) => setNewAutomation({ ...newAutomation, name: text })}
              placeholder="Automation Name"
            />

            <Text style={local_styles.inputLabel}>Trigger</Text>
            <View style={local_styles.optionsContainer}>
              {triggerOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    local_styles.optionButton,
                    newAutomation.trigger === option.value && local_styles.optionButtonSelected
                  ]}
                  onPress={() => setNewAutomation({ ...newAutomation, trigger: option.value })}
                >
                  <Text style={[
                    local_styles.optionButtonText,
                    newAutomation.trigger === option.value && local_styles.optionButtonTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {newAutomation.trigger === 'Time of Day' && (
              <View>
                <Text style={local_styles.inputLabel}>Time</Text>
                <View style={local_styles.timeInputContainer}>
                  <TextInput
                    style={local_styles.timeInput}
                    value={newAutomation.timeInput}
                    onChangeText={(text) => {
                      if (/^[0-9]{0,2}:[0-9]{0,2}$/.test(text) || /^[0-9]{0,2}$/.test(text)) {
                        setNewAutomation({ ...newAutomation, timeInput: text });
                      }
                    }}
                    placeholder="00:00"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                  
                  <View style={local_styles.periodSelector}>
                    <TouchableOpacity
                      style={[
                        local_styles.periodOption,
                        newAutomation.timePeriod === 'AM' && local_styles.periodOptionSelected
                      ]}
                      onPress={() => setNewAutomation({ ...newAutomation, timePeriod: 'AM' })}
                    >
                      <Text style={[
                        local_styles.periodOptionText,
                        newAutomation.timePeriod === 'AM' && local_styles.periodOptionTextSelected
                      ]}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        local_styles.periodOption,
                        newAutomation.timePeriod === 'PM' && local_styles.periodOptionSelected
                      ]}
                      onPress={() => setNewAutomation({ ...newAutomation, timePeriod: 'PM' })}
                    >
                      <Text style={[
                        local_styles.periodOptionText,
                        newAutomation.timePeriod === 'PM' && local_styles.periodOptionTextSelected
                      ]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={local_styles.timeHelpText}>
                  Enter time in 12-hour format (e.g., 09:30)
                </Text>
              </View>
            )}

            {newAutomation.trigger === 'Temperature' && (
              <>
              <View style={local_styles.temperatureInputContainer}>
                <TextInput
                  style={local_styles.temperatureInput}
                  value={newAutomation.triggerValue}
                  onChangeText={(text) => setNewAutomation({ ...newAutomation, triggerValue: text })}
                  placeholder="Enter temperature"
                  keyboardType="numeric"
                />
                <Text style={local_styles.temperatureUnit}>°C</Text>
              </View>

                <Text style={local_styles.inputLabel}>Temperature Comparison</Text>
                <View style={local_styles.optionsContainer}>
                  {temperatureComparisonOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        local_styles.optionButton,
                        newAutomation.temperatureComparison === option.value && local_styles.optionButtonSelected
                      ]}
                      onPress={() => setNewAutomation({ ...newAutomation, temperatureComparison: option.value })}
                    >
                      <Text style={[
                        local_styles.optionButtonText,
                        newAutomation.temperatureComparison === option.value && local_styles.optionButtonTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={local_styles.inputLabel}>Select Thermostat Sensor</Text>
                <Text style={local_styles.timeHelpText}>
                  Select the thermostat that will be used to measure the temperature.
                </Text>
                <View style={local_styles.deviceSelectionContainer}>
                  {/* Filter to only show thermostats */}
                  {(devices.length > 0 ? devices : availableDevices)
                    .filter(device => {
                      // Safely check if this is a thermostat
                      const deviceType = device.deviceType || device.name;
                      return deviceType === 'Thermostat';
                    })
                    .map(device => (
                    <TouchableOpacity
                      key={device.id}
                      style={[
                        local_styles.deviceSelectionItem,
                        newAutomation.triggerDevice?.id === device.id && local_styles.deviceSelectionItemSelected
                      ]}
                      onPress={() => setNewAutomation({ ...newAutomation, triggerDevice: device })}
                    >
                      <MaterialCommunityIcons name="thermometer" size={24} color="#666" />
                      <View style={local_styles.deviceSelectionInfo}>
                        <Text style={local_styles.deviceSelectionName}>{device.name || device.deviceName}</Text>
                        <Text style={local_styles.deviceSelectionLocation}>{device.location}</Text>
                      </View>
                      {newAutomation.triggerDevice?.id === device.id && (
                        <Check size={20} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={local_styles.timeHelpText}>
                  Note: Temperature automations require selecting a thermostat sensor above and at least one device to control below.
                </Text>
              </>
            )}

            <Text style={local_styles.inputLabel}>Devices</Text>
            <View style={local_styles.deviceSelectionContainer}>
              {devices.length > 0 
                ? devices.map(renderDeviceItem)
                : availableDevices.map(renderDeviceItem)}
            </View>

            <Text style={local_styles.inputLabel}>Action</Text>
            <View style={local_styles.optionsContainer}>
              {actionOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    local_styles.optionButton,
                    newAutomation.actions === option.value && local_styles.optionButtonSelected
                  ]}
                  onPress={() => setNewAutomation({ ...newAutomation, actions: option.value })}
                >
                  <Text style={[
                    local_styles.optionButtonText,
                    newAutomation.actions === option.value && local_styles.optionButtonTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(newAutomation.actions === 'Set Temperature' || newAutomation.actions === 'Set Brightness') && (
              <View style={local_styles.valueInputContainer}>
                <TextInput
                  style={local_styles.valueInput}
                  value={newAutomation.actionValue}
                  onChangeText={(text) => setNewAutomation({ ...newAutomation, actionValue: text })}
                  placeholder={`Enter ${newAutomation.actions === 'Set Temperature' ? 'temperature' : 'brightness'}`}
                  keyboardType="numeric"
                />
                <Text style={local_styles.valueUnit}>
                  {newAutomation.actions === 'Set Temperature' ? '°C' : '%'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={local_styles.saveButton}
              onPress={createNewAutomation}
            >
              <Text style={local_styles.saveButtonText}>Save Automation</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Format AM/PM time from a time string
  const formatAMPMTime = (timeString: string | undefined): string => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':').map(num => parseInt(num.trim(), 10));
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  // Helper function to find device by ID
  const findDeviceById = (id: string | number): DeviceType | undefined => {
    return devices.find(device => device.id === id);
  };

  // Check if a device is in an automation
  const isDeviceInAutomation = (id: string | number, automation: AutomationType): boolean => {
    if (!automation.devices) return false;
    return automation.devices.some(device => 
      (typeof device === 'string' && device === id) || 
      (typeof device === 'object' && device.id === id)
    );
  };

  // Map device IDs to device objects
  const mapDevicesToObjects = (device: DeviceType) => {
    return {
      id: device.id,
      name: device.deviceName || device.name || 'Unknown Device',
      deviceType: device.deviceType || 'Unknown Type'
    };
  };

  // Render automation item for the list
  const renderAutomationItem = ({ item }: { item: AutomationListItem }) => {
    if (item.isAddCard) {
      return (
        <TouchableOpacity
          style={local_styles.addCard}
          onPress={() => setAddModalVisible(true)}
        >
          <Plus size={40} color="#666" />
          <Text style={local_styles.addCardText}>Add New Automation</Text>
        </TouchableOpacity>
      );
    } else {
      const automation = item as AutomationType;
    return (
      <View style={local_styles.automationCardContainer}>
        {isEditing && (
          <TouchableOpacity
            style={local_styles.deleteButton}
            onPress={() => {
              // Delete directly without confirmation for immediate feedback
              console.log("Deleting automation:", automation.id);
              // First update UI immediately
              setAutomations(prev => prev.filter(a => a.id !== automation.id));
              // Then delete from Firestore
              deleteAutomationInFirebase(automation.id)
                .then(result => {
                  console.log("Firestore deletion result:", result);
                  if (!result.success) {
                    // If Firestore delete failed, show error and reload automations
                    console.error("Failed to delete from Firestore:", result.error);
                    Alert.alert("Error", "Failed to delete from Firestore. The automation may reappear after refresh.");
                    if (userId) loadAutomations(userId);
                  }
                })
                .catch(error => {
                  console.error("Error deleting from Firestore:", error);
                  Alert.alert("Error", "Failed to delete from Firestore. The automation may reappear after refresh.");
                  if (userId) loadAutomations(userId);
                });
            }}
          >
            <MaterialCommunityIcons name="minus-circle" size={24} color="red" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[local_styles.automationCard, !automation.isActive && local_styles.inactiveCard]}
          onPress={() => {
            if (!isEditing) {
              setSelectedAutomation(automation);
              setDetailsModalVisible(true);
            }
          }}
        >
          <View style={local_styles.cardHeader}>
            <View style={local_styles.cardTitleContainer}>
                <Text style={local_styles.cardTitle}>{automation.name}</Text>
              <Text style={local_styles.cardSubtitle}>
                  {formatTriggerText(automation.trigger, automation.triggerTime, automation.triggerValue, automation.triggerDevice)}
              </Text>
            </View>
            <Switch
                value={automation.isActive}
                onValueChange={() => toggleAutomation(automation.id)}
            />
          </View>
          
          <View style={local_styles.deviceList}>
              {automation.devices.map((device) => (
              <View key={device.id} style={local_styles.deviceChip}>
                <Text style={local_styles.deviceChipText}>
                  {device.name}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </View>
    );
    }
  };

  const debugAutomation = async (automationId: string) => {
    try {
      console.log(`Debugging automation: ${automationId}`);
      Alert.alert("Debug", "Forcing check of this automation...");
      
      // Run the force check
      const result = await forceCheckAutomation(automationId);
      console.log("Force check result:", JSON.stringify(result, null, 2));
      
      // Display results to user
      let message = "";
      if (result.success) {
        if (result.executed) {
          message = "Automation was triggered successfully! Check your devices.";
          
          // If there's temperature information, include it
          if (result.currentTemp !== undefined && result.triggerValue !== undefined) {
            message += `\n\nCurrent temperature: ${result.currentTemp}°C\nTrigger value: ${result.triggerValue}°C\n\n${result.evaluation || ''}`;
          }
          
          // Include results from executed actions
          if (result.results && result.results.length > 0) {
            message += "\n\nExecuted actions:";
            result.results.forEach((r, i) => {
              message += `\n${i+1}. Device ${r.deviceId}: ${r.action || 'Action'} - ${r.success ? 'Success' : 'Failed'}`;
            });
          }
        } else {
          message = result.message || "Automation conditions were not met.";
          
          // Add detailed information for temperature automations
          if (result.currentTemp !== undefined && result.triggerValue !== undefined) {
            message += `\n\nCurrent temperature: ${result.currentTemp}°C\nTrigger value: ${result.triggerValue}°C\n\n${result.evaluation || ''}`;
            
            // Add device data if available
            if (result.deviceData) {
              const device = result.deviceData;
              message += `\n\nThermostat Device: ${device.name || 'Unnamed'} (ID: ${device.id})`;
              if (device.settings) {
                message += `\nSettings: Temperature = ${device.settings.temperature}°C`;
              }
            }
          }
        }
      } else {
        message = `Error: ${result.error || 'Unknown error'}`;
        
        // If there's device data in the error response, include it
        if (result.deviceData) {
          message += `\n\nDevice Data: ${JSON.stringify(result.deviceData, null, 2)}`;
        }
      }
      
      Alert.alert("Debug Results", message);
      
    } catch (error: any) {
      console.error("Error debugging automation:", error);
      Alert.alert("Debug Error", `An error occurred: ${error.message || 'Unknown error'}`);
    }
  };

  // Render details modal for the selected automation
  const renderDetailsModal = () => {
    if (!selectedAutomation) return null;
    
    return (
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={local_styles.modalOverlay}>
          <View style={local_styles.addModalContainer}>
            <View style={local_styles.modalHeader}>
              <Text style={local_styles.modalTitle}>{selectedAutomation.name}</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <X size={24} color="#666" />
        </TouchableOpacity>
      </View>
            
            <ScrollView style={local_styles.addModalContent}>
              <View style={local_styles.detailRow}>
                <Text style={local_styles.detailLabel}>Trigger:</Text>
                <Text style={local_styles.detailValue}>
                  {selectedAutomation.trigger.startsWith('Temperature') 
                    ? `Temperature ${selectedAutomation.trigger.split(' ')[1]}`
                    : selectedAutomation.trigger
                  }
                </Text>
              </View>
              
              {selectedAutomation.triggerTime && (
                <View style={local_styles.detailRow}>
                  <Text style={local_styles.detailLabel}>Time:</Text>
                  <Text style={local_styles.detailValue}>{selectedAutomation.triggerTime}</Text>
                </View>
              )}
              
              {selectedAutomation.triggerValue && (
                <View style={local_styles.detailRow}>
                  <Text style={local_styles.detailLabel}>Value:</Text>
                  <Text style={local_styles.detailValue}>
                    {selectedAutomation.triggerValue}
                    {selectedAutomation.trigger.includes('Temperature') && '°C'}
                  </Text>
                </View>
              )}
              
              {/* Display trigger device for temperature automations */}
              {selectedAutomation.trigger.includes('Temperature') && selectedAutomation.triggerDevice && (
                <View style={local_styles.detailRow}>
                  <Text style={local_styles.detailLabel}>Sensor:</Text>
                  <Text style={local_styles.detailValue}>
                    {selectedAutomation.triggerDevice.name || selectedAutomation.triggerDevice.deviceName} ({selectedAutomation.triggerDevice.location})
                  </Text>
                </View>
              )}
              
              <View style={local_styles.detailRow}>
                <Text style={local_styles.detailLabel}>Action:</Text>
                <Text style={local_styles.detailValue}>{selectedAutomation.actions}</Text>
              </View>
              
              {selectedAutomation.actionValue && (
                <View style={local_styles.detailRow}>
                  <Text style={local_styles.detailLabel}>Action Value:</Text>
                  <Text style={local_styles.detailValue}>
                    {selectedAutomation.actionValue}
                    {selectedAutomation.actions === 'Set Temperature' && '°C'}
                    {selectedAutomation.actions === 'Set Brightness' && '%'}
                  </Text>
                </View>
              )}
              
              <Text style={local_styles.detailSectionTitle}>Devices:</Text>
              <View style={local_styles.detailDeviceList}>
                {selectedAutomation.devices.map((device, index) => (
                  <View key={index} style={local_styles.detailDeviceItem}>
                    <MaterialCommunityIcons 
                      name={device.icon || "devices"} 
                      size={24} 
                      color="#001322" 
                    />
                    <Text style={local_styles.detailDeviceName}>{device.name}</Text>
                    {device.location && (
                      <Text style={local_styles.detailDeviceLocation}>{device.location}</Text>
                    )}
                  </View>
                ))}
              </View>
              
              <View style={local_styles.detailButtonsRow}>
                <TouchableOpacity
                  style={[local_styles.detailButton, local_styles.deleteButtonStyle]}
                  onPress={() => handleDeleteAutomation(selectedAutomation.id)}
                >
                  <Text style={local_styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[local_styles.detailButton, local_styles.editDetailButton]}
                  onPress={() => {
                    // Future implementation for editing automations
                    Alert.alert("Coming Soon", "Editing automations will be available in a future update.");
                  }}
                >
                  <Text style={local_styles.editDetailButtonText}>Edit</Text>
                </TouchableOpacity>

                {selectedAutomation.trigger.startsWith('Temperature') && (
                  <TouchableOpacity
                    style={[local_styles.detailButton, local_styles.debugButton]}
                    onPress={() => debugAutomation(selectedAutomation.id)}
                  >
                    <Text style={local_styles.debugButtonText}>Debug</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const syncAutomations = async () => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to sync automations");
      return;
    }
    
    try {
      setIsLoading(true);
      Alert.alert("Sync Started", "Checking your automations...");
      
      console.log("Manually syncing automations for user:", userId);
      
      // Get all active automations for this user
      const result: any = await getUserAutomations(userId);
      
      if (result && result.success && result.automations && result.automations.length > 0) {
        console.log(`Found ${result.automations.length} automations to check`);
        
        // Check time-based automations
        const timeResult = await checkTimeBasedAutomations(userId);
        
        // Check temperature-based automations
        const tempResult = await checkTemperatureBasedAutomations(userId);
        
        // Refresh automations list to get any updates (like lastTriggered timestamps)
        await loadAutomations(userId);
        
        // Show summary to user
        let message = "Sync complete!\n\n";
        
        if (timeResult.executed) {
          message += `- Executed ${timeResult.count} time-based automations\n`;
        } else {
          message += "- No time-based automations triggered\n";
        }
        
        if (tempResult.executed) {
          message += `- Executed ${tempResult.count} temperature-based automations\n`;
        } else {
          message += "- No temperature-based automations triggered\n";
        }
        
        Alert.alert("Sync Complete", message);
      } else {
        Alert.alert("Sync Complete", "No automations found to check");
      }
    } catch (error: any) {
      console.error("Error syncing automations:", error);
      Alert.alert("Sync Failed", `An error occurred: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to handle pull-to-refresh
  const onRefresh = React.useCallback(() => {
    if (!userId) return;
    
    setRefreshing(true);
    syncAutomations().finally(() => {
      setRefreshing(false);
    });
  }, [userId]);

  const isDesktop = Platform.OS === 'web';

  return (
    <View style={[local_styles.container, isDesktop ? local_styles.desktop_container : local_styles.mobile_container]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={local_styles.header}>
          <Text style={local_styles.headerText}>Automations</Text>
          <View style={local_styles.headerButtons}>
          <TouchableOpacity
            style={local_styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={[local_styles.editButtonText, isEditing && local_styles.activeEditButton]}>
              {isEditing ? 'Done' : 'Configure'}
            </Text>
          </TouchableOpacity>
            
            <TouchableOpacity 
              style={local_styles.refreshButton}
              onPress={syncAutomations}
              disabled={isLoading}
            >
              <RefreshCw size={20} color="#001322" />
          </TouchableOpacity>
          </View>
        </View>
        
        {isLoading ? (
          <View style={local_styles.loaderContainer}>
            <Text style={local_styles.loadingText}>Loading automations...</Text>
          </View>
        ) : (
        <FlatList
          data={[...automations, ...(isEditing ? [{ id: 'add-card', isAddCard: true }] : [])]}
          renderItem={renderAutomationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={local_styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#514D92']}
                tintColor="#514D92"
              />
            }
          />
        )}

        {renderAddModal()}
        {renderDetailsModal()}
        <Chatbot />
        <NavBar />
      </KeyboardAvoidingView>
    </View>
  );
}

const local_styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    // paddingTop: Platform.OS === 'ios' ? 10 : 100,
    // paddingLeft: Platform.OS === 'web' ? 70 : 0,
    // //paddingBottom: Platform.OS === 'web' ? 0 : 80,
    // marginLeft: 55,
    // marginTop: 20,

  },
  desktop_container: {
    flex: 1,
    marginLeft: 55,
    marginTop: 20,
    paddingLeft: Platform.OS === 'web' ? 70 : 0,
  },
  mobile_container: {
    flex: 1,
    //padding: 1,
    //paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#514D92',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  refreshButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#001322',
    borderRadius: 15,
  },
  editButtonText: {
    color: '#fffcf2',
    fontWeight: 'bold',
  },
  activeEditButton: {
    color: '#fffcf2',
  },
  // Keep the rest of your existing local_styles...
  automationCardContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  automationCard: {
    backgroundColor: '#001322',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  cardSubtitle: {
    fontSize: 18,
    //color: '#ccc',
    color: 'white',
    marginTop: 2,
  },
  deviceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  deviceChip: {
    backgroundColor: 'rgba(152, 172, 201, 0.15)',
    
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  deviceChipText: {
    fontSize: 14,
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  addCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#001322',
  },
  addCardText: {
    marginTop: 8,
    fontSize: 16,
    color: '#001322',
    fontWeight: '500',
  },
  // Keep all other local_styles...


  // modalOverlay: {
  //   flex: 1,
  //   backgroundColor: 'rgba(0, 0, 0, 0.5)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    // Add platform-specific padding
    ...Platform.select({
      ios: {
        paddingTop: 20,
        paddingBottom: 40
      }
    })
  },
  // addModalContainer: {
  //   backgroundColor: '#fff',
  //   borderRadius: 20,
  //   padding: 20,
  //   width: '90%',
  //   maxWidth: 500,
  //   maxHeight: '80%',
  // },

  addModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    
    maxWidth: 500,
    maxHeight: Platform.OS === 'ios' ? '85%' : '80%',
    // Add shadow for iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4
      }
    })
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addModalContent: {
    flexGrow: 1
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#001322',
  },
  optionButtonText: {
    color: '#666',
    fontSize: 14,
  },
  optionButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  timePickerButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  temperatureInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  temperatureInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  temperatureUnit: {
    fontSize: 16,
    color: '#666',
  },
  deviceSelectionContainer: {
    marginTop: 8,
  },
  deviceSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  deviceSelectionItemSelected: {
    backgroundColor: '#f0f8ff',
    borderColor: '#001322',
  },
  deviceSelectionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },

  deviceSelectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deviceSelectionName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  deviceSelectionLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  valueInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  valueUnit: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#001322',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Add these new styles to your local_styles StyleSheet
timeInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
  marginBottom: 4,
},
timeInput: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  marginRight: 8,
},
periodSelector: {
  flexDirection: 'row',
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  overflow: 'hidden',
},
periodOption: {
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: '#f0f0f0',
},
periodOptionSelected: {
  backgroundColor: '#001322',
},
periodOptionText: {
  fontSize: 16,
  color: '#666',
  fontWeight: '500',
},
periodOptionTextSelected: {
  color: '#fff',
  fontWeight: '600',
},
timeHelpText: {
  fontSize: 12,
  color: '#666',
  marginTop: 4,
  fontStyle: 'italic',
},

// Detail modal styles
detailRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
  paddingBottom: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
detailLabel: {
  fontSize: 16,
  fontWeight: '600',
  color: '#666',
},
detailValue: {
  fontSize: 16,
  color: '#333',
},
detailSectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
  marginTop: 16,
  marginBottom: 12,
},
detailDeviceList: {
  marginBottom: 24,
},
detailDeviceItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  marginBottom: 8,
},
detailDeviceName: {
  fontSize: 16,
  color: '#333',
  marginLeft: 8,
  flex: 1,
},
detailDeviceLocation: {
  fontSize: 14,
  color: '#666',
  marginLeft: 4,
},
detailButtonsRow: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginTop: 24,
  marginBottom: 16,
},
detailButton: {
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  minWidth: 120,
  alignItems: 'center',
},
deleteButtonStyle: {
  backgroundColor: '#ff6b6b',
},
deleteButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},
editDetailButton: {
  backgroundColor: '#001322',
},
editDetailButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},
noDevicesText: {
  textAlign: 'center',
  fontSize: 16,
  color: '#666',
  fontStyle: 'italic',
  padding: 20,
},
debugButton: {
  backgroundColor: '#514D92',
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 5,
  marginHorizontal: 5,
},
debugButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#333',
},
});