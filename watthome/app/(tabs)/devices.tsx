import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView, Switch, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from "./LoginStyles";
import Chatbot from './chatbot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDevice, getUserDevices, deleteDevice, updateDeviceState, getUserDeviceStates, updateDeviceSettings, getDeviceEnergyStats } from '../../backend/deviceService';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getFirestore, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';

import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  "TypeError: genAI.listModels is not a function",
]);

type DeviceType = 'Smart Light' | 'Thermostat' | 'CCTV' | 'TV' | 'Roomba' | 'Washing Machine' | 'Heart Rate Monitor';

interface Device {
  id: number; // or string, depending on your Firestore ID type
  name: string;
  location: string;
  icon: string;
  deviceType: DeviceType; // Assuming DeviceType is already defined
  settings?: { [key: string]: any }; // Add this line to include settings
}

interface DeviceGroup {
  id: number;
  name: string;
  devices: number[];
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
            style={styles.glowIcon}
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

const getIconForType = (type: DeviceType) => {
  switch(type) {
    case 'Smart Light': return 'lightbulb-outline';
    case 'Thermostat': return 'thermometer';
    case 'CCTV': return 'cctv';
    case 'Heart Rate Monitor': return 'heart-box-outline';
    case 'TV': return 'television';
    case 'Roomba': return 'robot-vacuum';
    case 'Washing Machine': return 'washing-machine';
    default: return 'lightbulb-outline'; // Default icon
  }
};

const DevicesPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]); // Initialize as empty
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedDevicesForGroup, setSelectedDevicesForGroup] = useState<number[]>([]);
  
  const isDesktop = Platform.OS === 'web';
  const [activeTab, setActiveTab] = useState<'devices' | 'groups'>('devices');
  const [devices, setDevices] = useState<Device[]>([]); // Initialize as empty
  const [deviceStates, setDeviceStates] = useState<{ [key: number]: boolean }>({});
  const [temperatures, setTemperatures] = useState<{ [key: number]: number }>({});
  const [brightness, setBrightness] = useState<{ [key: number]: number }>({});
  const [roombaSpeed, setRoombaSpeed] = useState('Medium');
  const [volume, setVolume] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: number }>({});
  const [editMode, setEditMode] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceLocation, setNewDeviceLocation] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('Smart Light');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deviceSettings, setDeviceSettings] = useState<{ [key: string]: any }>({});
  
  const WASHING_MACHINE_ID = 11; // ID of the washing machine
  const [isLoading, setIsLoading] = useState(true);
  const [deviceUsageStats, setDeviceUsageStats] = useState<{ [key: string]: {
    totalUsageTime: number;
    currentSessionTime: number;
    totalEnergy: number;
  } }>({});

  // Add these functions to your DevicesPage component

// Function to save device groups to AsyncStorage
const saveDeviceGroups = async (groups: DeviceGroup[]) => {
  try {
    await AsyncStorage.setItem('deviceGroups', JSON.stringify(groups));
    console.log('Device groups saved to AsyncStorage:', groups);
  } catch (error) {
    console.error('Error saving device groups to AsyncStorage:', error);
  }
};

// Function to load device groups from AsyncStorage
const loadDeviceGroups = async () => {
  try {
    const storedGroups = await AsyncStorage.getItem('deviceGroups');
    if (storedGroups) {
      const parsedGroups = JSON.parse(storedGroups);
      console.log('Loaded device groups from AsyncStorage:', parsedGroups);
      setDeviceGroups(parsedGroups);
    }
  } catch (error) {
    console.error('Error loading device groups from AsyncStorage:', error);
  }
};

  const defaultEnergyUsage: Record<DeviceType, number> = {
    'Smart Light': 10,
    'Thermostat': 50,
    'CCTV': 5,
    'TV': 30,
    'Roomba': 20,
    'Washing Machine': 60,
    'Heart Rate Monitor': 15
  };

  useEffect(() => {
    const auth = getAuth();
    
    // This function will fetch and setup devices when we have a user
    const setupUserDevices = async (userId: string) => {
      try {
        console.log("Fetching devices for user:", userId);
        let devicesFromDb = await getUserDevices(userId);
        
        // Log what we get from the database
        console.log("Devices from database:", JSON.stringify(devicesFromDb, null, 2));
        
        // Check if we actually got devices
        if (!devicesFromDb || devicesFromDb.length === 0) {
          console.log("No devices found for user");
          setDevices([]);
          return;
        }
        
        // Transform devices to ensure they have the correct icon based on deviceType
        devicesFromDb = devicesFromDb.map(device => ({
          ...device,
          name: device.name || device.deviceType || 'Unknown Device',
          icon: device.deviceType ? getIconForType(device.deviceType as DeviceType) : 'lightbulb-outline'
        }));
        
        console.log("Transformed devices:", JSON.stringify(devicesFromDb, null, 2));
        
<<<<<<< HEAD
        // Initialize device states from the isOn field of each device
        const initialDeviceStates: { [key: number]: boolean } = {};
        
        // Process each device and store its exact state
        devicesFromDb.forEach(device => {
          // Ensure we're using the correct ID type
          const deviceId = Number(device.id);
          
          // Handle all possible data formats 
          let isOn = false;
          
          if (typeof device.isOn === 'boolean') {
            isOn = device.isOn;
          } else if (device.isOn === 'true') {
            isOn = true;
          } else if (device.isOn === true) {
            isOn = true;
          }
          
          // Log the raw value and the interpreted boolean
          console.log(`Device ${deviceId} (${device.deviceName || device.name}): Raw isOn=${device.isOn} (${typeof device.isOn}), Interpreted=${isOn}`);
          
          // Store the state
          initialDeviceStates[deviceId] = isOn;
        });
        
        console.log("Final initial device states to set:", initialDeviceStates);
        
        // Apply states to the devices array to ensure consistency
        setDevices(devicesFromDb);
        setDeviceStates(initialDeviceStates);
        
        // Also save these states to AsyncStorage for backup
        try {
          await AsyncStorage.setItem('deviceStates', JSON.stringify(initialDeviceStates));
        } catch (error) {
          console.error("Error saving device states to AsyncStorage:", error);
        }
        
        // Load device settings for all devices
        await loadDeviceSettings();
        
        // If any devices are on, update their stats immediately
        const activeDevices = devicesFromDb.filter(device => initialDeviceStates[Number(device.id)]);
        if (activeDevices.length > 0) {
          console.log("Found active devices, updating stats:", activeDevices.map(d => d.id));
          await updateDeviceStats();
        }
=======
        // Load device states from Firestore (make sure this happens after devices are loaded)
        await loadDeviceStates();
>>>>>>> 395a46b972c457296338ca01026646b3e919e094
      } catch (error) {
        console.error("Error loading devices:", error);
        Alert.alert("Error", "Failed to load your devices. Please try again.");
      }
    };
    
    // This will run when the component mounts or when user auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        
        // Call our function to set up devices for this user
        await setupUserDevices(user.uid);
      } else {
        setUserId(null);
        setDevices([]);
      }
    });
    
    // On component mount, also check if user is already logged in
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid) {
      setUserId(currentUser.uid);
      setupUserDevices(currentUser.uid);
    }

    return () => unsubscribe();
  }, []);

  // Modify the loadDeviceStates function to load from Firestore instead of just AsyncStorage
  const loadDeviceStates = async () => {
    try {
      setIsLoading(true);
      console.log("Loading device states directly from Firestore...");
      
<<<<<<< HEAD
      // This time, we'll fetch the full device documents to get the latest state
      if (userId) {
        try {
          const userDevices = await getUserDevices(userId);
          
          if (userDevices && userDevices.length > 0) {
            console.log("Direct device fetch returned:", JSON.stringify(userDevices, null, 2));
            
            // Create a new state object based on these device documents
            const freshDeviceStates: { [key: number]: boolean } = {};
            
            userDevices.forEach(device => {
              const deviceId = Number(device.id);
              
              // Handle all possible data formats 
              let isOn = false;
              
              if (typeof device.isOn === 'boolean') {
                isOn = device.isOn;
              } else if (device.isOn === 'true') {
                isOn = true;
              } else if (device.isOn === true) {
                isOn = true;
              }
              
              freshDeviceStates[deviceId] = isOn;
              console.log(`Loaded device ${deviceId} (${device.deviceName || device.name}) with state: ${isOn} (raw=${device.isOn})`);
            });
            
            console.log("Setting fresh device states:", freshDeviceStates);
            setDeviceStates(freshDeviceStates);
            
            // Update our devices array as well to maintain consistency
            const updatedDevices = userDevices.map(device => ({
              ...device,
              icon: device.deviceType ? getIconForType(device.deviceType as DeviceType) : 'lightbulb-outline'
            }));
            
            setDevices(updatedDevices);
            
            // Also update AsyncStorage
            await AsyncStorage.setItem('deviceStates', JSON.stringify(freshDeviceStates));
          } else {
            console.log("No devices found when loading states");
          }
        } catch (error) {
          console.error("Error loading devices for states:", error);
        }
      }
      
      setIsLoading(false);
=======
      // First load device states from Firestore
      if (userId) {
        const response = await getUserDeviceStates(userId);
        if (response.success && response.deviceStates) {
          console.log("Loaded device states from Firestore:", response.deviceStates);
          // Type assertion to ensure empty object is accepted
          setDeviceStates(response.deviceStates as { [key: number]: boolean });
        } else {
          console.error("Error loading device states from Firestore:", response.error);
        }
        
        // Now load device settings
        await loadDeviceSettings();
      }
      
      // Optionally load from AsyncStorage as a fallback or to override
      const storedDeviceStates = await AsyncStorage.getItem('deviceStates');
      if (storedDeviceStates) {
        const parsedStates = JSON.parse(storedDeviceStates);
        console.log("Loaded device states from AsyncStorage:", parsedStates);
        // Merge with existing states
        setDeviceStates(prev => ({...prev, ...parsedStates}));
      }
      
      setIsLoading(false); // Set loading to false when done
>>>>>>> 395a46b972c457296338ca01026646b3e919e094
    } catch (error) {
      console.error('Error in loadDeviceStates:', error);
      setIsLoading(false);
    }
  };

  // Function to load device settings for all devices
  const loadDeviceSettings = async () => {
    try {
      if (!devices || devices.length === 0) return;
      
      console.log("Starting to load device settings");
      console.log("All devices:", devices.map(d => ({id: d.id, type: d.deviceType, idType: typeof d.id})));
      
      // Create objects to store settings for each device type
      const brightnessValues: { [key: string]: number } = {}; // Changed to string keys
      const tempValues: { [key: string]: number } = {}; // Changed to string keys
      const volumeValues: { [key: string]: number } = {}; // Changed to string keys
      const timeLeftValues: { [key: string]: number } = {}; // Changed to string keys
      let roombaSpeedValue = '';
      
      // For each device, get its settings
      for (const device of devices) {
        const deviceId = device.id;
        console.log(`Processing device ${deviceId} (${typeof deviceId}) of type ${device.deviceType}`);
        
        let deviceSettings = null;
        
        // First try to get settings from the device object
        if (device.settings) {
          deviceSettings = device.settings;
          console.log(`Found settings in device object for ${deviceId}:`, deviceSettings);
        } else {
          // Fallback to getting from Firestore
          const firestore = getFirestore();
          try {
            const deviceDoc = await getDoc(doc(firestore, "devices", deviceId.toString()));
            
            if (deviceDoc.exists()) {
              const deviceData = deviceDoc.data();
              if (deviceData.settings) {
                deviceSettings = deviceData.settings;
                console.log(`Loaded settings from Firestore for device ${deviceId}:`, deviceSettings);
              } else {
                console.log(`Device ${deviceId} exists but has no settings`);
              }
            } else {
              console.log(`Device ${deviceId} not found in Firestore`);
            }
          } catch (error) {
            console.error(`Error fetching device ${deviceId}:`, error);
          }
        }
        
        if (deviceSettings) {
          // For Smart Light devices
          if (device.deviceType === 'Smart Light' && deviceSettings.brightness !== undefined) {
            brightnessValues[deviceId] = deviceSettings.brightness;
            console.log(`Setting brightness for device ${deviceId} to ${deviceSettings.brightness}`);
          }
          // For Thermostat devices
          if (device.deviceType === 'Thermostat' && deviceSettings.temperature !== undefined) {
            tempValues[deviceId] = deviceSettings.temperature;
            console.log(`Setting temperature for device ${deviceId} to ${deviceSettings.temperature}`);
          }
          // For TV devices
          if (device.deviceType === 'TV' && deviceSettings.volume !== undefined) {
            volumeValues[deviceId] = deviceSettings.volume;
            console.log(`Setting volume for device ${deviceId} to ${deviceSettings.volume}`);
          }
          // For Roomba devices
          if (device.deviceType === 'Roomba' && deviceSettings.speed) {
            roombaSpeedValue = deviceSettings.speed;
            console.log(`Found roomba speed: ${deviceSettings.speed}`);
          }
          // For Washing Machine devices
          if (device.deviceType === 'Washing Machine' && deviceSettings.timeLeft !== undefined) {
            timeLeftValues[deviceId] = deviceSettings.timeLeft;
            console.log(`Setting timeLeft for device ${deviceId} to ${deviceSettings.timeLeft}`);
          }
        }
      }
      
      // Set the state values with the settings we loaded
      console.log("Final brightness values to set:", brightnessValues);
      console.log("Final temperature values to set:", tempValues);
      console.log("Final volume values to set:", volumeValues);
      console.log("Final timeLeft values to set:", timeLeftValues);
      console.log("Final roomba speed to set:", roombaSpeedValue);
      
      // Explicitly update all state values, even if empty
      setBrightness(brightnessValues);
      setTemperatures(tempValues);
      setVolume(volumeValues);
      setTimeLeft(timeLeftValues);
      if (roombaSpeedValue) {
        setRoombaSpeed(roombaSpeedValue);
      }
      
    } catch (error) {
      console.error('Error loading device settings:', error);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (showAddForm) {
      setShowAddForm(false);
    }
  };

  // Function to get devices for a specific group
  const getDevicesForGroup = (groupId: number) => {
    const group = deviceGroups.find(g => g.id === groupId);
    if (!group) return [];
    return devices.filter(device => group.devices.includes(device.id));
  };

  const addNewGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (selectedDevicesForGroup.length === 0) {
      Alert.alert('Error', 'Please select at least one device');
      return;
    }

    const newId = Math.max(...deviceGroups.map(g => g.id), 0) + 1;
    const newGroup = {
      id: newId,
      name: newGroupName,
      devices: selectedDevicesForGroup
    };

    const updatedGroups = [...deviceGroups, newGroup];
    setDeviceGroups(updatedGroups);
    saveDeviceGroups(updatedGroups);
    setNewGroupName('');
    setSelectedDevicesForGroup([]);
    setShowAddGroupForm(false);
  };

  // Function to remove a device group
  const removeGroup = (groupId: number) => {
    const updatedGroups = deviceGroups.filter(group => group.id !== groupId);
    setDeviceGroups(updatedGroups);
    saveDeviceGroups(updatedGroups); // Save to AsyncStorage
  };

  // Function to remove a device from a group
  const removeDeviceFromGroup = (groupId: number, deviceId: number) => {
    const updatedGroups = deviceGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          devices: group.devices.filter(id => id !== deviceId)
        };
      }
      return group;
    });
    setDeviceGroups(updatedGroups);
    saveDeviceGroups(updatedGroups);
  };

  const renderDeviceGroups = () => (
    <ScrollView style={styles.groupsContainer}>
      {deviceGroups.map(group => (
        <View key={group.id} style={styles.groupContainer}>
          <TouchableOpacity 
            style={styles.groupHeader}
            onPress={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
          >
            <View style={styles.groupTitleContainer}>
              <MaterialCommunityIcons 
                name={expandedGroup === group.id ? "chevron-down" : "chevron-right"} 
                size={24} 
                color="#fffcf2"
              />
              <Text style={styles.groupTitle}>{group.name}</Text>
            </View>
            {editMode && (
              <TouchableOpacity 
                style={styles.removeGroupButton}
                onPress={() => removeGroup(group.id)}
              >
                <MaterialCommunityIcons name="minus-circle" size={24} color="red" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
  
          {expandedGroup === group.id && (
            <View style={styles.groupDevices}>
              {getDevicesForGroup(group.id).map(device => (
                <View key={device.id} style={styles.deviceCard}>
                  {editMode && (
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeDeviceFromGroup(group.id, device.id)}
                    >
                      <MaterialCommunityIcons name="minus-circle" size={24} color="red" />
                    </TouchableOpacity>
                  )}
                  
                  <View style={styles.deviceHeader}>
                    <MaterialCommunityIcons name={getIconForType(device.deviceType)} size={40} color="#fffcf2" />
                    <Text style={styles.deviceName}>{device.name}</Text>
                  </View>
  
                  {device.deviceType === 'Thermostat' && deviceStates[device.id] && !editMode && (
                    <View style={styles.tempControls}>
                      <TouchableOpacity onPress={() => decreaseTemperature(device.id)}>
                        <MaterialCommunityIcons name="minus-circle-outline" size={30} color="red" />
                      </TouchableOpacity>
                      <Text style={styles.tempText}>
                        {temperatures[device.id] !== undefined ? temperatures[device.id] : 23}°C
                      </Text>
                      <TouchableOpacity onPress={() => increaseTemperature(device.id)}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={30} color="green" />
                      </TouchableOpacity>
                    </View>
                  )}
  
                  {device.deviceType === 'Smart Light' && deviceStates[device.id] && !editMode && (
                    <View style={styles.brightnessControls}>
                      <TouchableOpacity onPress={() => decreaseBrightness(device.id)}>
                        <MaterialCommunityIcons name="minus-circle-outline" size={30} color="red" />
                      </TouchableOpacity>
                      <Text style={styles.brightnessText}>
                        {brightness[device.id] !== undefined ? brightness[device.id] : 75}%
                      </Text>
                      <TouchableOpacity onPress={() => increaseBrightness(device.id)}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={30} color="green" />
                      </TouchableOpacity>
                    </View>
                  )}
  
                  {device.deviceType === 'Roomba' && deviceStates[device.id] && !editMode && (
                    <View style={styles.roombaControls}>
                      <Text style={styles.roombaSpeed}>{roombaSpeed}</Text>
                      <TouchableOpacity onPress={cycleRoombaSpeed}>
                        <MaterialCommunityIcons name="reload" size={17} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
  
                  {device.deviceType === 'TV' && deviceStates[device.id] && !editMode && (
                    <View style={styles.volumeControls}>
                      <TouchableOpacity onPress={() => decreaseVolume(device.id)}>
                        <MaterialCommunityIcons name="volume-minus" size={30} color="red" />
                      </TouchableOpacity>
                      <Text style={styles.volumeText}>
                        {volume[device.id] !== undefined ? volume[device.id] : 10}
                      </Text>
                      <TouchableOpacity onPress={() => increaseVolume(device.id)}>
                        <MaterialCommunityIcons name="volume-plus" size={30} color="green" />
                      </TouchableOpacity>
                    </View>
                  )}
  
                  {device.deviceType === 'Washing Machine' && deviceStates[device.id] && !editMode && (
                    <View style={styles.controlPanel}>
                      <Text style={styles.washingStatus}>
                        {deviceStates[device.id] ? `Running: ${formatTime(timeLeft[device.id] || 0)}` : 'Off'}
                      </Text>
                      {deviceStates[device.id] && (
                        <TouchableOpacity 
                          style={styles.resetButton}
                          onPress={() => resetWashingMachineTimer(device.id)}
                        >
                          <MaterialCommunityIcons name="restart" size={20} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
  
                  {device.deviceType === 'CCTV' && deviceStates[device.id] && !editMode && (
                    <View style={styles.controlPanel}>
                      <Text style={styles.controlText}>
                        {'Recording...'}
                      </Text>
                    </View>
                  )}

                  {device.deviceType === 'Heart Rate Monitor' && deviceStates[device.id] && !editMode && (
                    <View style={styles.controlPanel}>
                      <Text style={styles.controlText}>
                        {'Recording...'}
                      </Text>
                    </View>
                  )}
  
                  {!editMode && (
                    <Switch
                      value={Boolean(deviceStates[device.id])}
                      onValueChange={() => toggleSwitch(device.id)}
                      key={`switch-${device.id}-${deviceStates[device.id]}`}
                    />
                  )}

                  <View style={localStyles.deviceFooter}>

                  <Text style={localStyles.deviceLocation}>{device.location}
                  </Text>

                  {deviceStates[device.id] && !editMode && (
                    
                      <Text style={localStyles.deviceEnergy}>
                        {defaultEnergyUsage[device.deviceType] || 10} W/h
                      </Text>
                  )}

                  
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
  
      {editMode && (
        <TouchableOpacity 
          style={styles.addGroupButton}
          onPress={() => setShowAddGroupForm(true)}
        >
          <MaterialCommunityIcons name="plus-circle" size={50} color="#001322" />
          <Text style={styles.addGroupText}>Add Group</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
  

  // Add Group Form
  const renderAddGroupForm = () => (
    <View style={styles.addGroupFormContainer}>
      <View style={styles.addGroupForm}>
        <Text style={styles.addGroupFormTitle}>Add New Device Group</Text>
        
        <Text style={styles.formLabel}>Group Name</Text>
        <TextInput
          style={styles.formInput}
          value={newGroupName}
          onChangeText={setNewGroupName}
          placeholder="Enter group name"
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Select Devices</Text>
        <ScrollView style={styles.deviceSelector}>
          {devices.map(device => (
            <TouchableOpacity
              key={device.id}
              style={[
                styles.deviceOption,
                selectedDevicesForGroup.includes(device.id) && styles.selectedDevice
              ]}
              onPress={() => {
                setSelectedDevicesForGroup(prev => 
                  prev.includes(device.id)
                    ? prev.filter(id => id !== device.id)
                    : [...prev, device.id]
                );
              }}
            >
              <MaterialCommunityIcons 
                name={getIconForType(device.deviceType)} 
                size={24} 
                color={selectedDevicesForGroup.includes(device.id) ? "#001322" : "#ffffff"} 
              />
              <Text style={[
                styles.deviceOptionText,
                selectedDevicesForGroup.includes(device.id) && styles.selectedDeviceText
              ]}>
                {device.name} ({device.location})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.formButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowAddGroupForm(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addNewGroup}
          >
            <Text style={styles.addButtonText}>Add Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const removeDevice = async (id: number) => {
    const response = await deleteDevice(id);
    
    if (response.success) {
      setDevices(devices.filter(device => device.id !== id));
      // Clean up associated states...
    } else {
      Alert.alert('Error', response.error);
    }
  };

  // Modify the addNewDevice function to initialize the device state
  const addNewDevice = async () => {
    if (!userId) {
      Alert.alert('Error', 'User is not authenticated. Please log in.');
      return;
    }
    if (!newDeviceLocation) {
      Alert.alert('Error', 'Please enter a location for the device');
      return;
    }

    const deviceType = newDeviceType as DeviceType;
    const deviceName = newDeviceName.trim() || deviceType;
  
    const energyUsage = defaultEnergyUsage[newDeviceType as DeviceType] || 10; // Default to 10 if unknown type
  
  
    console.log(`Adding device for user: ${userId}, device type: ${deviceType}, location: ${newDeviceLocation}`);
    
    // Initial state is always off (false)
    const response = await addDevice(userId, deviceName, deviceType, energyUsage, newDeviceLocation, false);
    console.log('Add Device Response:', response);
  
    if (response.success) {
      // Convert the ID to a number before using it
      const newDeviceId = Number(response.id);
      setDevices([...devices, { 
        id: newDeviceId,
        name: deviceName,
        location: newDeviceLocation,
        deviceType: deviceType,
        icon: getIconForType(deviceType)
      }]);
      
      // Initialize the device state to off
      setDeviceStates(prev => ({...prev, [newDeviceId]: false}));
      
      setNewDeviceName('');
      setNewDeviceLocation('');
      setShowAddForm(false);
    } else {
      Alert.alert('Error', response.error);
    }
  };
  

  // Update the toggleSwitch function to save state to Firestore as well
  const toggleSwitch = async (id: number) => {
    setDeviceStates((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      
      // Save to Firestore
      if (userId) {
        updateDeviceState(id.toString(), newState[id])
          .then(response => {
            if ('success' in response && !response.success && 'error' in response) {
              console.error('Error saving device state to Firestore:', response.error);
            } else {
              console.log(`Device ${id} state updated in Firestore to ${newState[id]}`);
            }
          })
          .catch(error => {
            console.error('Exception saving device state to Firestore:', error);
          });
      }

      // Save to AsyncStorage as backup
      AsyncStorage.setItem('deviceStates', JSON.stringify(newState)).catch((error) => {
        console.error('Error saving device states to AsyncStorage:', error);
      });

      // If this is the washing machine and we're turning it on, reset the timer
<<<<<<< HEAD
        if (id === WASHING_MACHINE_ID && !deviceStates[id]) {
        setTimeLeft((prevTime) => ({ ...prevTime, [id]: 1200 })); // 20 minutes
      }
    } catch (error) {
        console.error('Error in toggleSwitch:', error);
        // Revert local state on error
        const prevStateValue = deviceStates[id];
        setDeviceStates(prev => ({ ...prev, [id]: !prev[id] })); // Revert to previous state
    }
=======
      if (id === WASHING_MACHINE_ID && newState[id]) {
        setTimeLeft((prevTime) => ({ ...prevTime, [id]: 1200 })); // 20 minutes
      }

      return newState;
    });
>>>>>>> 395a46b972c457296338ca01026646b3e919e094
  };

  // Update the temperature functions to save to Firestore
  const increaseTemperature = (id: number) => {
    setTemperatures((prev) => {
      const newTemp = (prev[id] || 23) + 1;
      
      // Update in Firestore
      updateDeviceSettings(id.toString(), { temperature: newTemp })
        .then(response => {
          if ('success' in response && !response.success && 'error' in response) {
            console.error('Error saving temperature to Firestore:', response.error);
          }
        })
        .catch(error => {
          console.error('Exception saving temperature to Firestore:', error);
        });
      
      return { ...prev, [id]: newTemp };
    });
  };

  const decreaseTemperature = (id: number) => {
    setTemperatures((prev) => {
      const newTemp = (prev[id] || 23) - 1;
      
      // Update in Firestore
      updateDeviceSettings(id.toString(), { temperature: newTemp })
        .then(response => {
          if ('success' in response && !response.success && 'error' in response) {
            console.error('Error saving temperature to Firestore:', response.error);
          }
        })
        .catch(error => {
          console.error('Exception saving temperature to Firestore:', error);
        });
      
      return { ...prev, [id]: newTemp };
    });
  };

  // Update the brightness functions to save to Firestore
  const increaseBrightness = (id: number) => {
    setBrightness((prev) => {
      const newBrightness = (prev[id] || 75) + 5;
      
      // Update in Firestore
      updateDeviceSettings(id.toString(), { brightness: newBrightness })
        .then(response => {
          if ('success' in response && !response.success && 'error' in response) {
            console.error('Error saving brightness to Firestore:', response.error);
          }
        })
        .catch(error => {
          console.error('Exception saving brightness to Firestore:', error);
        });
      
      return { ...prev, [id]: newBrightness };
    });
  };

  const decreaseBrightness = (id: number) => {
    setBrightness((prev) => {
      const newBrightness = Math.max((prev[id] || 75) - 5, 0);
      
      // Update in Firestore
      updateDeviceSettings(id.toString(), { brightness: newBrightness })
        .then(response => {
          if ('success' in response && !response.success && 'error' in response) {
            console.error('Error saving brightness to Firestore:', response.error);
          }
        })
        .catch(error => {
          console.error('Exception saving brightness to Firestore:', error);
        });
      
      return { ...prev, [id]: newBrightness };
    });
  };

  // Update the volume functions to save to Firestore
  const increaseVolume = (id: number) => {
    setVolume((prev) => {
      const newVolume = (prev[id] || 10) + 1;
      
      // Update in Firestore
      updateDeviceSettings(id.toString(), { volume: newVolume })
        .then(response => {
          if ('success' in response && !response.success && 'error' in response) {
            console.error('Error saving volume to Firestore:', response.error);
          }
        })
        .catch(error => {
          console.error('Exception saving volume to Firestore:', error);
        });
      
      return { ...prev, [id]: newVolume };
    });
  };

  const decreaseVolume = (id: number) => {
    setVolume((prev) => {
      const newVolume = (prev[id] || 10) - 1;
      
      // Update in Firestore
      updateDeviceSettings(id.toString(), { volume: newVolume })
        .then(response => {
          if ('success' in response && !response.success && 'error' in response) {
            console.error('Error saving volume to Firestore:', response.error);
          }
        })
        .catch(error => {
          console.error('Exception saving volume to Firestore:', error);
        });
      
      return { ...prev, [id]: newVolume };
    });
  };

  // Update Roomba speed cycle function
  const cycleRoombaSpeed = () => {
    const speeds = ['Low', 'Medium', 'High'];
    const currentIndex = speeds.indexOf(roombaSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    
    // Find Roomba device id
    const roombaDevice = devices.find(d => d.deviceType === 'Roomba');
    if (roombaDevice) {
      // Update in Firestore
      updateDeviceSettings(roombaDevice.id.toString(), { speed: newSpeed })
        .then(response => {
          if ('success' in response && !response.success && 'error' in response) {
            console.error('Error saving speed to Firestore:', response.error);
          }
        })
        .catch(error => {
          console.error('Exception saving speed to Firestore:', error);
        });
    }
    
    setRoombaSpeed(newSpeed);
  };

  // Update washing machine timer reset
  const resetWashingMachineTimer = (id: number) => {
    const newTime = 1200; // 20 minutes
    setTimeLeft(prev => {
      // Update in Firestore
      updateDeviceSettings(id.toString(), { timeLeft: newTime })
        .then(response => {
          if ('success' in response && !response.success && 'error' in response) {
            console.error('Error saving timeLeft to Firestore:', response.error);
          }
        })
        .catch(error => {
          console.error('Exception saving timeLeft to Firestore:', error);
        });
      
      return { ...prev, [id]: newTime };
    });
  };

  // Modify the washing machine timer update effect to also update Firestore occasionally
  useEffect(() => {
    // Check if washing machine is on
    const washingMachine = devices.find(d => d.id === WASHING_MACHINE_ID);
    if (washingMachine && deviceStates[WASHING_MACHINE_ID] && (timeLeft[WASHING_MACHINE_ID] || 0) > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const currentTime = prev[WASHING_MACHINE_ID] || 0;
          if (currentTime <= 0) return prev;
          
          const newTime = currentTime - 1;
          
          // Update Firestore every 30 seconds to avoid too many writes
          if (newTime % 30 === 0) {
            updateDeviceSettings(WASHING_MACHINE_ID.toString(), { timeLeft: newTime })
              .catch(error => {
                console.error('Error updating washing machine timer in Firestore:', error);
              });
          }
          
          return { ...prev, [WASHING_MACHINE_ID]: newTime };
        });
      }, 1000);
  
      return () => clearInterval(timer);
    }
  }, [deviceStates, timeLeft, devices]); 

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Update the refresh function to also load device settings
  const refreshDevices = async () => {
    if (!userId) {
      Alert.alert('Error', 'User is not authenticated. Please log in.');
      return;
    }
    
    try {
<<<<<<< HEAD
      setIsLoading(true);
      console.log("Refreshing devices for user:", userId);
=======
      setIsLoading(true); // Set loading state
>>>>>>> 395a46b972c457296338ca01026646b3e919e094
      
      // Get the latest devices with their current states
      let devicesFromDb = await getUserDevices(userId);
<<<<<<< HEAD
      console.log("Fresh devices from database:", JSON.stringify(devicesFromDb, null, 2));
      
      if (!devicesFromDb || devicesFromDb.length === 0) {
        console.log("No devices found during refresh");
        setDevices([]);
        setDeviceStates({});
        setIsLoading(false);
        Alert.alert('Info', 'No devices found for your account.');
        return;
      }
=======
>>>>>>> 395a46b972c457296338ca01026646b3e919e094
      
      // Transform devices
      devicesFromDb = devicesFromDb.map(device => ({
        ...device,
        name: device.name || device.deviceType || 'Unknown Device',
        icon: device.deviceType ? getIconForType(device.deviceType as DeviceType) : 'lightbulb-outline'
      }));
      
      // Create fresh device states object
      const freshDeviceStates: { [key: number]: boolean } = {};
      
<<<<<<< HEAD
      // Process each device with detailed logging
      devicesFromDb.forEach(device => {
        const deviceId = Number(device.id);
        
        // Handle all possible data formats 
        let isOn = false;
        
        if (typeof device.isOn === 'boolean') {
          isOn = device.isOn;
        } else if (device.isOn === 'true') {
          isOn = true;
        } else if (device.isOn === true) {
          isOn = true;
        }
        
        freshDeviceStates[deviceId] = isOn;
        console.log(`Refreshed device ${deviceId} (${device.name}): state=${isOn} (raw=${device.isOn}, type=${typeof device.isOn})`);
      });
      
      console.log("Setting fresh device states:", freshDeviceStates);
      
      // Update both devices and states
      setDevices(devicesFromDb);
      setDeviceStates(freshDeviceStates);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('deviceStates', JSON.stringify(freshDeviceStates));
      
      // Also reload settings
      await loadDeviceSettings();
      
      setIsLoading(false);
=======
      // Load device states and settings from Firestore
      await loadDeviceStates(); // This now also loads settings
      
      setIsLoading(false); // Clear loading state
>>>>>>> 395a46b972c457296338ca01026646b3e919e094
      Alert.alert('Success', 'Devices and settings refreshed successfully');
    } catch (error) {
      console.error("Error refreshing devices:", error);
      setIsLoading(false);
      Alert.alert("Error", "Failed to refresh your devices. Please try again.");
    }
  };

  // Add this function to update device stats periodically
  const updateDeviceStats = async () => {
    const activeDevices = devices.filter(device => deviceStates[device.id]);
    
    for (const device of activeDevices) {
      try {
        const stats = await getDeviceEnergyStats(device.id.toString());
        if (stats.success) {setDeviceUsageStats(prev => ({
            ...prev,
            [device.id]: stats.stats
          }));
        }
      } catch (error) {
        console.error(`Error updating stats for device ${device.id}:`, error);
      }
    }
  };
  useEffect(() => {
  const fetchDeviceStates = async () => {
    try {
      const devicesRef = collection(db, 'devices');
      const q = query(devicesRef);
      const snapshot = await getDocs(q);
      const newStates: Record<string, boolean> = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        newStates[doc.id] = !!data.isOn; // Ensure isOn is properly converted to boolean
      });

      setDeviceStates(newStates); // Update state with fetched values
    } catch (error) {
      console.error("Error fetching device states:", error);
    }
  };

  fetchDeviceStates();
}, [devices]); // Dependency ensures it re-fetches when devices change

  

  // Add a useEffect to update stats every 10 seconds for active devices
  useEffect(() => {
    if (devices.some(device => deviceStates[device.id])) {
      const interval = setInterval(updateDeviceStats, 10000);
      // Initial update
      updateDeviceStats();
      
      return () => clearInterval(interval);
    }
  }, [deviceStates, devices]);

  // Add a helper function to format time
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours}h ${minutes}m ${secs}s`;
  };

  useEffect(() => {
    loadDeviceGroups();
  }
  , []);

  return (
    <View style={[styles.dev_container, isDesktop ? styles.desktopContainer : styles.mobileContainer]}>

      <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
              style={localStyles.keyboardAvoidingContainer}
              enabled={Platform.OS !== 'web'}
            >

          <View style={styles.contentContainer}>
            {/* Header with Edit Button */}
            <View style={styles.headerContainer}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'devices' && styles.activeTab]}
                  onPress={() => setActiveTab('devices')}
                >
                  <Text style={styles.tabText}>Devices</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'groups' && styles.activeTab]}
                  onPress={() => setActiveTab('groups')}
                >
                  <Text style={styles.tabText}>Device Groups</Text>
                </TouchableOpacity>
              </View>
              <View style={localStyles.headerButtons}>
                {/* Add refresh button */}
                <TouchableOpacity 
                  style={localStyles.refreshButton}
                  onPress={refreshDevices}
                >
                  <MaterialCommunityIcons name="refresh" size={24} color="#001322" />
                </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={toggleEditMode}
              >
                <Text style={styles.editButtonText}>{editMode ? 'Done' : 'Edit'}</Text>
              </TouchableOpacity>
              </View>
            </View>

            {/* Devices Display */}
            {activeTab === 'devices' ? (
              <ScrollView 
                contentContainerStyle={styles.deviceGrid}
                showsVerticalScrollIndicator={true}
              >
                {isLoading ? (
                  <View style={localStyles.loadingContainer}>
                    <Text style={localStyles.loadingText}>Loading devices...</Text>
                  </View>
                ) : (
                  <>
                {devices.map((device) => (
                  <View key={device.id} style={styles.deviceCard}>
                    {editMode && (
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeDevice(device.id)}
                      >
                        <MaterialCommunityIcons name="minus-circle" size={24} color="red" />
                      </TouchableOpacity>
                    )}
                    
                    <View style={styles.deviceHeader}>
                      <MaterialCommunityIcons name={getIconForType(device.deviceType)} size={40} color="#fffcf2" />
                      <Text style={styles.deviceName}>{device.name}</Text>
                    </View>

                        {device.deviceType === 'Thermostat' && deviceStates[device.id] && !editMode && (
                      <View style={styles.tempControls}>
                        <TouchableOpacity onPress={() => decreaseTemperature(device.id)}>
                          <MaterialCommunityIcons name="minus-circle-outline" size={30} color="red" />
                        </TouchableOpacity>
                            <Text style={styles.tempText}>
                              {temperatures[device.id] !== undefined ? temperatures[device.id] : 23}°C
                            </Text>
                        <TouchableOpacity onPress={() => increaseTemperature(device.id)}>
                          <MaterialCommunityIcons name="plus-circle-outline" size={30} color="green" />
                        </TouchableOpacity>
                      </View>
                    )}

                        {device.deviceType === 'Smart Light' && deviceStates[device.id] && !editMode && (
                      <View style={styles.brightnessControls}>
                        <TouchableOpacity onPress={() => decreaseBrightness(device.id)}>
                          <MaterialCommunityIcons name="minus-circle-outline" size={30} color="red" />
                        </TouchableOpacity>
                            <Text style={styles.brightnessText}>
                              {brightness[device.id] !== undefined ? brightness[device.id] : 75}%
                            </Text>
                        <TouchableOpacity onPress={() => increaseBrightness(device.id)}>
                          <MaterialCommunityIcons name="plus-circle-outline" size={30} color="green" />
                        </TouchableOpacity>
                      </View>
                    )}

                        {device.deviceType === 'Roomba' && deviceStates[device.id] && !editMode && (
                      <View style={styles.roombaControls}>
                        <Text style={styles.roombaSpeed}>{roombaSpeed}</Text>
                        <TouchableOpacity onPress={cycleRoombaSpeed}>
                          <MaterialCommunityIcons name="reload" size={17} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}

                        {device.deviceType === 'TV' && deviceStates[device.id] && !editMode && (
                      <View style={styles.volumeControls}>
                        <TouchableOpacity onPress={() => decreaseVolume(device.id)}>
                          <MaterialCommunityIcons name="volume-minus" size={30} color="red" />
                        </TouchableOpacity>
                            <Text style={styles.volumeText}>
                              {volume[device.id] !== undefined ? volume[device.id] : 10}
                            </Text>
                        <TouchableOpacity onPress={() => increaseVolume(device.id)}>
                          <MaterialCommunityIcons name="volume-plus" size={30} color="green" />
                        </TouchableOpacity>
                      </View>
                    )}

                        {device.deviceType === 'Washing Machine' && deviceStates[device.id] && !editMode && (
                      <View style={styles.controlPanel}>
                        <Text style={styles.washingStatus}>
                          {deviceStates[device.id] ? `Running: ${formatTime(timeLeft[device.id] || 0)}` : 'Off'}
                        </Text>
                        {deviceStates[device.id] && (
                          <TouchableOpacity 
                            style={styles.resetButton}
                                onPress={() => resetWashingMachineTimer(device.id)}
                          >
                            <MaterialCommunityIcons name="restart" size={20} color="white" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                        {device.deviceType === 'CCTV' && deviceStates[device.id] && !editMode && (
                      <View style={styles.controlPanel}>
                        <Text style={styles.controlText}>
                          {'Recording...'}
                        </Text>
                      </View>
                    )}

                        {device.deviceType === 'Heart Rate Monitor' && deviceStates[device.id] && !editMode && (
                      <View style={styles.controlPanel}>
                        <Text style={styles.controlText}>
                          {'Recording...'}
                        </Text>
                      </View>
                    )}

<<<<<<< HEAD
                    {!editMode && (
                      <Switch
                            value={Boolean(deviceStates[device.id])}
                        onValueChange={() => toggleSwitch(device.id)}
                            key={`switch-${device.id}-${deviceStates[device.id]}`}
                      />
                    )}
                    <Text style={styles.deviceLocation}>{device.location}</Text>
=======
                        {!editMode && (
                          <Switch
                            value={deviceStates[device.id]}
                            onValueChange={() => toggleSwitch(device.id)}
                          />
                        )}
                        <View style={localStyles.deviceFooter}>
                        <Text style={localStyles.deviceLocation}>{device.location}
                        </Text>
>>>>>>> 395a46b972c457296338ca01026646b3e919e094

                        {deviceStates[device.id] && !editMode && (
                          
                            <Text style={localStyles.deviceEnergy}>
                              {defaultEnergyUsage[device.deviceType] || 10} W/h
                            </Text>
                        )}
<<<<<<< HEAD
                  </View>
                ))}

                {/* Add New Device Card */}
                {editMode && (
                  <TouchableOpacity 
                    style={styles.addDeviceCard}
                    onPress={() => setShowAddForm(true)}
                  >
                    <MaterialCommunityIcons name="plus-circle" size={50} color="#001322" />
                    <Text style={styles.addDeviceText}>Add Device</Text>
                  </TouchableOpacity>
=======
                        
                        </View>
                      </View>
                    ))}
                    
                    {/* Add New Device Card */}
                    {editMode && (
                      <TouchableOpacity 
                        style={styles.addDeviceCard}
                        onPress={() => setShowAddForm(true)}
                      >
                        <MaterialCommunityIcons name="plus-circle" size={50} color="#001322" />
                        <Text style={styles.addDeviceText}>Add Device</Text>
                      </TouchableOpacity>
>>>>>>> 395a46b972c457296338ca01026646b3e919e094
                    )}
                  </>
                )}
              </ScrollView>
            ) : (
              <>
                {renderDeviceGroups()}
                {showAddGroupForm && renderAddGroupForm()}
              </>
            )}

            {/* Add Device Form */}
            {showAddForm && (
              <View style={styles.addDeviceFormContainer}>
                <View style={styles.addDeviceForm}>
                  <Text style={styles.addDeviceFormTitle}>Add New Device</Text>
                  
                  <Text style={styles.formLabel}>Device Type</Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {['Smart Light', 'Thermostat', 'CCTV', 'TV', 'Roomba', 'Washing Machine', 'Pill Dispenser', 'Heart Rate Monitor'].map((type) => (
                        <TouchableOpacity 
                          key={type}
                          style={[
                            styles.deviceTypeOption,
                            newDeviceType === type && styles.selectedDeviceType
                          ]}
                          onPress={() => setNewDeviceType(type)}
                        >
                          <Text style={[
                            styles.deviceTypeText,
                            newDeviceType === type && styles.selectedDeviceTypeText
                          ]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  <Text style={styles.formLabel}>Location</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newDeviceLocation}
                    onChangeText={setNewDeviceLocation}
                    placeholder="Enter location (e.g. Living Room)"
                    placeholderTextColor="#999"
                  />
                  
                  <View style={styles.formButtons}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => setShowAddForm(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={addNewDevice}
                    >
                      <Text style={styles.addButtonText}>Add Device</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            
          </View>
          <Chatbot />
          <NavBar />

      </KeyboardAvoidingView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  keyboardAvoidingContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: 1000,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 15,
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  loadingText: {
    color: "#001322",
    fontSize: 16,
    fontStyle: 'italic'
  },
  usageInfo: {
    marginTop: 5,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
  },
  usageText: {
    color: "##32cd32",
    fontSize: 12,
  },
  energyText: {
    color: "##32cd32",
    fontSize: 12,
    fontWeight: 'bold',
  },
  // energyBadge: {
  //   position: 'absolute',
 
  //   // right: 10,
  //   // bottom: 10,
  //   backgroundColor: 'rgba(0, 19, 34, 0.7)',
  //   // paddingHorizontal: 8,
  //   // paddingVertical: 4,
  //   borderRadius: 12,
  //   marginTop: 5,
  // },
  energyBadgeText: {
    fontSize: 12,
    color: 'green',
    marginTop: 5,
  },
  deviceFooter: {
    flexDirection: 'row', // Align items in a row
    justifyContent: 'space-between', // Space between location and energy
    alignItems: 'center', // Align items vertically
    marginTop: 10, // Add some spacing from the top
    width: '100%', // Ensure it spans the full width of the card
    padding: 5, // Add some padding to the footer
  },
  deviceLocation: {
    fontSize: 14,
    color: 'white', // Keep the location text white
    fontWeight: 'bold',
    paddingRight: 5,
    alignContent: 'center',
    //paddingLeft: 50,
  },
  deviceEnergy: {
    fontSize: 14,
    color: 'green', // Set the energy text to green
    fontWeight: 'bold',
    marginRight: 10, // Add some spacing from the location text
  },
});

export default DevicesPage;
