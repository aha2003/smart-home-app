import React, { useState, useEffect } from 'react';
import { View, Text,StyleSheet, TouchableOpacity, Modal, FlatList, Platform, Switch, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Sun, Moon, Clock, Power, Plus, Thermometer, CreditCard as Edit, X, Check } from 'lucide-react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from "./LoginStyles";
import Chatbot from './chatbot';
import AsyncStorage from '@react-native-async-storage/async-storage';




import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  "TypeError: genAI.listModels is not a function",
]);


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
const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString;
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

export default function AutomationsScreen() {
  const [automations, setAutomations] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // New automation form state
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger: '',
    timeInput: '12:00',
    timePeriod: 'AM',
    triggerValue: '',
    devices: [],
    actions: '',
    actionValue: '',
  });

  const triggerOptions = [
    { label: 'Time of Day', value: 'Time of Day' },
    { label: 'Temperature Above', value: 'Temperature Above' },
    { label: 'Temperature Below', value: 'Temperature Below' },
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

useEffect(() => {
  const loadAutomations = async () => {
    try {
      const storedAutomations = await AsyncStorage.getItem('automations');
      if (storedAutomations) {
        setAutomations(JSON.parse(storedAutomations));
      } else {
        // If no automations are saved, load the default automations
        setAutomations(defaultAutomations);
      }
    } catch (error) {
      console.error('Error loading automations from AsyncStorage:', error);
      // If there's an error, fallback to default automations
      setAutomations(defaultAutomations);
    }
  };

  loadAutomations();
}, []);

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

  const saveNewAutomation = async () => {
    if (!newAutomation.name || !newAutomation.trigger || newAutomation.devices.length === 0 || !newAutomation.actions) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate time format
    if (newAutomation.trigger === 'Time of Day') {
      const timePattern = /^(0[1-9]|1[0-2]):[0-5][0-9]$/;
      if (!timePattern.test(newAutomation.timeInput)) {
        alert('Please enter a valid time in the format HH:MM (e.g., 09:30)');
        return;
      }
    }

    const newId = `auto_${Date.now()}`;
    const formattedTime = `${newAutomation.timeInput} ${newAutomation.timePeriod}`;

    const automationToAdd = {
      id: newId,
      name: newAutomation.name,
      trigger: newAutomation.trigger,
      triggerTime: formattedTime,
      triggerValue: newAutomation.triggerValue,
      devices: newAutomation.devices,
      actions: newAutomation.actions,
      actionValue: newAutomation.actionValue,
      isActive: true,
      notifyBefore: false,
      frequency: 'Daily',
    };

    const updatedAutomations = [...automations, automationToAdd];
    setAutomations(updatedAutomations);

    try {
      await AsyncStorage.setItem('automations', JSON.stringify(updatedAutomations));
    } catch (error) {
      console.error('Error saving automations to AsyncStorage:', error);
    }

    setAddModalVisible(false);
    setNewAutomation({
      name: '',
      trigger: '',
      timeInput: '12:00',
      timePeriod: 'PM',
      triggerValue: '',
      devices: [],
      actions: '',
      actionValue: '',
    });
  };

  const toggleAutomation = (id) => {
    setAutomations(automations.map(auto => 
      auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
    ));
  };

  const deleteAutomation = (id) => {
    setAutomations(automations.filter(auto => auto.id !== id));
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

            {(newAutomation.trigger === 'Temperature Above' || newAutomation.trigger === 'Temperature Below') && (
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
            )}

            <Text style={local_styles.inputLabel}>Devices</Text>
            <View style={local_styles.deviceSelectionContainer}>
              {availableDevices.map(renderDeviceItem)}
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
              onPress={saveNewAutomation}
            >
              <Text style={local_styles.saveButtonText}>Save Automation</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderAutomationItem = ({ item }) => {
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
    }

    return (
      <View style={local_styles.automationCardContainer}>
        {isEditing && (
          <TouchableOpacity
            style={local_styles.deleteButton}
            onPress={() => deleteAutomation(item.id)}
          >
            <MaterialCommunityIcons name='minus-circle' size={24} color="red" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[local_styles.automationCard, !item.isActive && local_styles.inactiveCard]}
          onPress={() => {
            if (!isEditing) {
              setSelectedAutomation(item);
              setDetailsModalVisible(true);
            }
          }}
        >
          <View style={local_styles.cardHeader}>
            <View style={local_styles.cardTitleContainer}>
              <Text style={local_styles.cardTitle}>{item.name}</Text>
              <Text style={local_styles.cardSubtitle}>
                {item.trigger} • {item.triggerTime}
              </Text>
            </View>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleAutomation(item.id)}
            />
          </View>
          
          <View style={local_styles.deviceList}>
            {item.devices.map((device) => (
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
  };

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
          <TouchableOpacity
            style={local_styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={[local_styles.editButtonText, isEditing && local_styles.activeEditButton]}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={[...automations, ...(isEditing ? [{ id: 'add-card', isAddCard: true }] : [])]}
          renderItem={renderAutomationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={local_styles.listContainer}
        />

        {renderAddModal()}
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
});