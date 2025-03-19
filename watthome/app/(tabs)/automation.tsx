import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform, Switch, TextInput, ScrollView ,KeyboardAvoidingView } from 'react-native';
import { Sun, Moon, Clock, Power, Plus, Thermometer, CreditCard as Edit, X, Check } from 'lucide-react-native';
import { Link } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from "./LoginStyles";
import Chatbot from './chatbot';


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
const formatTime = (date) => {
  if (!date) return '';
  if (typeof date === 'string') return date;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Available devices for selection
const availableDevices = [
  { id: 1, name: 'Smart Light', location: 'Living Room', icon: 'lightbulb-outline' },
  { id: 2, name: 'Thermostat ', location: 'Living Room', icon: 'thermometer' },
  { id: 3, name: 'CCTV', location: 'Front Door', icon: 'cctv' },
  { id: 4, name: 'TV', location: 'Living Room', icon: 'television' },
  { id: 5, name: 'Smart Light', location: 'BedRoom', icon: 'lightbulb-outline' },
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

// Default automations data
const defaultAutomations = [
  {
    id: '1',
    name: 'Night Mode',
    devices: [
      { id: '1', name: 'Living Room Lights', location: 'Living_Room' },
      { id: '9', name: 'Kitchen Lights', location: 'Kitchen' }
    ],
    trigger: 'Time of Day',
    triggerTime: '22:00',
    triggerValue: null,
    actions: 'Turn Off',
    actionValue: null,
    frequency: 'Daily',
    notifyBefore: false,
    isActive: true
  },
  {
    id: '2',
    name: 'Morning Routine',
    devices: [
      { id: '5', name: 'Bedroom Lights', location: 'Bedroom' },
      { id: '6', name: 'Thermostat', location: 'Living_Room' }
    ],
    trigger: 'Time of Day',
    triggerTime: '07:00',
    triggerValue: null,
    actions: 'Turn On',
    actionValue: null,
    frequency: 'Weekdays',
    notifyBefore: true,
    isActive: true
  }
];

export default function AutomationsScreen() {
  const [automations, setAutomations] = useState(defaultAutomations);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // New automation form state
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger: '',
    triggerTime: new Date(),
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

  const toggleAutomation = (id) => {
    setAutomations(automations.map(auto => 
      auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
    ));
  };

  const deleteAutomation = (id) => {
    setAutomations(automations.filter(auto => auto.id !== id));
  };

  const getIcon = (name) => {
    return <Clock size={24} color="#FFA500" />;
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setNewAutomation({
        ...newAutomation,
        triggerTime: selectedDate,
      });
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

  const saveNewAutomation = () => {
    if (!newAutomation.name || !newAutomation.trigger || newAutomation.devices.length === 0 || !newAutomation.actions) {
      alert('Please fill in all required fields');
      return;
    }

    const newId = `auto_${Date.now()}`;
    const formattedTime = formatTime(newAutomation.triggerTime);
    
    const automationToAdd = {
      id: newId,
      ...newAutomation,
      triggerTime: formattedTime,
      isActive: true,
      notifyBefore: false,
      frequency: 'Daily',
    };

    setAutomations([...automations, automationToAdd]);
    setAddModalVisible(false);
    setNewAutomation({
      name: '',
      trigger: '',
      triggerTime: new Date(),
      triggerValue: '',
      devices: [],
      actions: '',
      actionValue: '',
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




  const renderAddCard = () => {
    if (!isEditing) return null;
    
    return (
      <TouchableOpacity
        style={local_styles.addCard}
        onPress={() => setAddModalVisible(true)}
      >
        <Plus size={40} color="#666" />
        <Text style={local_styles.addCardText}>Add New Automation</Text>
      </TouchableOpacity>
    );
  };

  const renderAutomationItem = ({ item }) => {
    if (item.isAddCard) {
      return renderAddCard();
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
            {/* {getIcon(item.name)} */}
            <View style={local_styles.cardTitleContainer}>
              <Text style={local_styles.cardTitle}>{item.name}</Text>
              <Text style={local_styles.cardSubtitle}>
                {item.trigger} • {item.triggerTime}
              </Text>
            </View>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleAutomation(item.id)}
              // trackColor={{ false: '#767577', true: '#4caf50' }}
              //thumbColor={'#f4f3f4'}
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
              <TouchableOpacity
                style={local_styles.timePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={20} color="#666" />
                <Text style={local_styles.timePickerButtonText}>
                  {formatTime(newAutomation.triggerTime)}
                </Text>
              </TouchableOpacity>
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
              {/* {availableDevices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={[
                    local_styles.deviceSelectionItem,
                    newAutomation.devices.some(d => d.id === device.id) && local_styles.deviceSelectionItemSelected
                  ]}
                  onPress={() => toggleDeviceSelection(device)}
                >
                  {getIcon(device.type)}
                  <Text style={local_styles.deviceSelectionText}>{device.name}</Text>
                  {newAutomation.devices.some(d => d.id !== device.id) && (
                    <Check size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))} */}
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

      {showTimePicker && (
        <DateTimePicker
          value={newAutomation.triggerTime}
          mode="time"
          is24Hour={false}
          display="spinner"
          onChange={handleTimeChange}
        />
      )}
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


  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
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
    flex: 1,
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
    backgroundColor: '#FFA500',
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
    borderColor: '#FFA500',
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
    backgroundColor: '#4CAF50',
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
});