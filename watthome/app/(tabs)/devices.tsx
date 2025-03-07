import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from "./LoginStyles";
//comitt test 
const NavBar = () => {
  const isDesktop = Platform.OS === 'web';

  return (
    <View style={[styles.navBar, isDesktop ? styles.desktopNav : styles.mobileNav]}>
      <Link href="/" asChild>
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

const initialDeviceGroups = [
  {
    id: 1,
    name: 'Living Room Devices',
    devices: [1, 2, 3, 4] // Device IDs
  },
  {
    id: 2,
    name: 'Kitchen Devices',
    devices: [8, 9, 10, 11]
  },
  {
    id: 3,
    name: 'Bedroom Devices',
    devices: [5, 6]
  },
  {
    id: 4,
    name: 'Outdoor Devices',
    devices: [7]
  }
];

const initialDevices: { id: number, name: string, location: string, icon: 'lightbulb-outline' | 'thermometer' | 'cctv' | 'television' | 'robot-vacuum' | 'washing-machine' }[] = [
  { id: 1, name: 'Smart Light', location: 'Living Room', icon: 'lightbulb-outline' },
  { id: 2, name: 'Thermostat', location: 'Living Room', icon: 'thermometer' },
  { id: 3, name: 'CCTV', location: 'Front Door', icon: 'cctv' },
  { id: 4, name: 'TV', location: 'Living Room', icon: 'television' },
  { id: 5, name: 'Smart Light', location: 'BedRoom', icon: 'lightbulb-outline' },
  { id: 6, name: 'Thermostat', location: 'Bedroom', icon: 'thermometer' },
  { id: 7, name: 'CCTV', location: 'Garage Door', icon: 'cctv' },
  { id: 8, name: 'Roomba', location: 'Kitchen', icon: 'robot-vacuum' },
  { id: 9, name: 'Smart Light', location: 'Kitchen', icon: 'lightbulb-outline' },
  { id: 10, name: 'Thermostat', location: 'Kitchen', icon: 'thermometer' },
  { id: 11, name: 'Washing Machine', location: 'Kitchen', icon: 'washing-machine' },
];

const DevicesPage = () => {

  const [deviceGroups, setDeviceGroups] = useState(initialDeviceGroups);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedDevicesForGroup, setSelectedDevicesForGroup] = useState<number[]>([]);

  const isDesktop = Platform.OS === 'web';
  const [activeTab, setActiveTab] = useState<'devices' | 'groups'>('devices');
  const [devices, setDevices] = useState(initialDevices);
  const [deviceStates, setDeviceStates] = useState<{ [key: number]: boolean }>(
    initialDevices.reduce((acc, device) => ({ ...acc, [device.id]: false }), {})
  );
  const [temperatures, setTemperatures] = useState<{ [key: number]: number }>({});
  const [brigntness, setBrightness] = useState<{ [key: number]: number }>({});
  const [roombaSpeed, setRoombaSpeed] = useState('Medium');
  const [volume, setVolume] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: number }>({});
  const [editMode, setEditMode] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceLocation, setNewDeviceLocation] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('Smart Light');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const WASHING_MACHINE_ID = 11; // ID of the washing machine

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

    setDeviceGroups([...deviceGroups, newGroup]);
    setNewGroupName('');
    setSelectedDevicesForGroup([]);
    setShowAddGroupForm(false);
  };

  // Function to remove a device group
  const removeGroup = (groupId: number) => {
    setDeviceGroups(deviceGroups.filter(group => group.id !== groupId));
  };

  // Function to remove a device from a group
  const removeDeviceFromGroup = (groupId: number, deviceId: number) => {
    setDeviceGroups(deviceGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          devices: group.devices.filter(id => id !== deviceId)
        };
      }
      return group;
    }));
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
                    <MaterialCommunityIcons name={device.icon} size={40} color="#fffcf2" />
                    <Text style={styles.deviceName}>{device.name}</Text>
                  </View>
  
                  {device.name === 'Thermostat' && deviceStates[device.id] && !editMode && (
                    <View style={styles.tempControls}>
                      <TouchableOpacity onPress={() => decreaseTemperature(device.id)}>
                        <MaterialCommunityIcons name="minus-circle-outline" size={30} color="red" />
                      </TouchableOpacity>
                      <Text style={styles.tempText}>{temperatures[device.id] || 23}°C</Text>
                      <TouchableOpacity onPress={() => increaseTemperature(device.id)}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={30} color="green" />
                      </TouchableOpacity>
                    </View>
                  )}
  
                  {device.name === 'Smart Light' && deviceStates[device.id] && !editMode && (
                    <View style={styles.brightnessControls}>
                      <TouchableOpacity onPress={() => decreaseBrightness(device.id)}>
                        <MaterialCommunityIcons name="minus-circle-outline" size={30} color="red" />
                      </TouchableOpacity>
                      <Text style={styles.brightnessText}>{brigntness[device.id] || 75}%</Text>
                      <TouchableOpacity onPress={() => increaseBrightness(device.id)}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={30} color="green" />
                      </TouchableOpacity>
                    </View>
                  )}
  
                  {device.name === 'Roomba' && deviceStates[device.id] && !editMode && (
                    <View style={styles.roombaControls}>
                      <Text style={styles.roombaSpeed}>{roombaSpeed}</Text>
                      <TouchableOpacity onPress={cycleRoombaSpeed}>
                        <MaterialCommunityIcons name="reload" size={17} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
  
                  {device.name === 'TV' && deviceStates[device.id] && !editMode && (
                    <View style={styles.volumeControls}>
                      <TouchableOpacity onPress={() => decreaseVolume(device.id)}>
                        <MaterialCommunityIcons name="volume-minus" size={30} color="red" />
                      </TouchableOpacity>
                      <Text style={styles.volumeText}>{volume[device.id] || 10}</Text>
                      <TouchableOpacity onPress={() => increaseVolume(device.id)}>
                        <MaterialCommunityIcons name="volume-plus" size={30} color="green" />
                      </TouchableOpacity>
                    </View>
                  )}
  
                  {device.name === 'Washing Machine' && deviceStates[device.id] && !editMode && (
                    <View style={styles.controlPanel}>
                      <Text style={styles.washingStatus}>
                        {deviceStates[device.id] ? `Running: ${formatTime(timeLeft[device.id] || 0)}` : 'Off'}
                      </Text>
                      {deviceStates[device.id] && (
                        <TouchableOpacity 
                          style={styles.resetButton}
                          onPress={() => setTimeLeft(prev => ({ ...prev, [device.id]: 1200 }))}
                        >
                          <MaterialCommunityIcons name="restart" size={20} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
  
                  {device.name === 'CCTV' && deviceStates[device.id] && !editMode && (
                    <View style={styles.controlPanel}>
                      <Text style={styles.controlText}>
                        {'Recording...'}
                      </Text>
                    </View>
                  )}
  
                  {!editMode && (
                    <Switch value={deviceStates[device.id]} onValueChange={() => toggleSwitch(device.id)} />
                  )}
                  <Text style={styles.deviceLocation}>{device.location}</Text>
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
                name={device.icon} 
                size={24} 
                color={selectedDevicesForGroup.includes(device.id) ? "#fff" : "#001322"} 
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

  const removeDevice = (id: number) => {
    setDevices(devices.filter(device => device.id !== id));
    
    // Clean up associated states
    setDeviceStates(prev => {
      const newState = {...prev};
      delete newState[id];
      return newState;
    });
    
    setTemperatures(prev => {
      const newTemp = {...prev};
      delete newTemp[id];
      return newTemp;
    });
    
    setBrightness(prev => {
      const newBrightness = {...prev};
      delete newBrightness[id];
      return newBrightness;
    });
    
    setVolume(prev => {
      const newVolume = {...prev};
      delete newVolume[id];
      return newVolume;
    });
    
    setTimeLeft(prev => {
      const newTimeLeft = {...prev};
      delete newTimeLeft[id];
      return newTimeLeft;
    });
  };

  const addNewDevice = () => {
    if (!newDeviceLocation) {
      Alert.alert('Error', 'Please enter a location for the device');
      return;
    }

    const getIconForType = (type: string) => {
      switch(type) {
        case 'Smart Light': return 'lightbulb-outline';
        case 'Thermostat': return 'thermometer';
        case 'CCTV': return 'cctv';
        case 'TV': return 'television';
        case 'Roomba': return 'robot-vacuum';
        case 'Washing Machine': return 'washing-machine';
        default: return 'lightbulb-outline';
      }
    };

    const newId = Math.max(...devices.map(d => d.id), 0) + 1;
    const newDevice = {
      id: newId,
      name: newDeviceType,
      location: newDeviceLocation,
      icon: getIconForType(newDeviceType) as 'lightbulb-outline' | 'thermometer' | 'cctv' | 'television' | 'robot-vacuum' | 'washing-machine'
    };

    setDevices([...devices, newDevice]);
    setDeviceStates(prev => ({ ...prev, [newId]: false }));
    setNewDeviceName('');
    setNewDeviceLocation('');
    setShowAddForm(false);
  };

  const toggleSwitch = (id: number) => {
    setDeviceStates((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      
      // If this is the washing machine and we're turning it on, reset the timer
      if (id === WASHING_MACHINE_ID && newState[id]) {
        setTimeLeft(prevTime => ({ ...prevTime, [id]: 1200 })); // 20 minutes
      }
      
      return newState;
    });
  };

  const increaseTemperature = (id: number) => {
    setTemperatures((prev) => ({ ...prev, [id]: (prev[id] || 23) + 1 }));
  };

  const decreaseTemperature = (id: number) => {
    setTemperatures((prev) => ({ ...prev, [id]: (prev[id] || 23) - 1 }));
  };

  const increaseBrightness = (id: number) => {
    setBrightness((prev) => ({ ...prev, [id]: (prev[id] || 75) + 5 }));
  };

  const decreaseBrightness = (id: number) => {
    setBrightness((prev) => ({ ...prev, [id]: (prev[id] || 75) - 5 }));
  };

  const increaseVolume = (id: number) => {
    setVolume((prev) => ({ ...prev, [id]: (prev[id] || 10) + 1 }));
  };

  const decreaseVolume = (id: number) => {
    setVolume((prev) => ({ ...prev, [id]: (prev[id] || 10) - 1 }));
  };

  useEffect(() => {
    // Check if washing machine is on
    const washingMachine = devices.find(d => d.id === WASHING_MACHINE_ID);
    if (washingMachine && deviceStates[WASHING_MACHINE_ID] && (timeLeft[WASHING_MACHINE_ID] || 0) > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const currentTime = prev[WASHING_MACHINE_ID] || 0;
          if (currentTime <= 0) return prev;
          return { ...prev, [WASHING_MACHINE_ID]: currentTime - 1 };
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

  const cycleRoombaSpeed = () => {
    const speeds = ['Low', 'Medium', 'High'];
    const currentIndex = speeds.indexOf(roombaSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setRoombaSpeed(speeds[nextIndex]);
  };

  return (
    <View style={[styles.dev_container, isDesktop ? styles.desktopContainer : styles.mobileContainer]}>
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
          <TouchableOpacity 
            style={styles.editButton}
            onPress={toggleEditMode}
          >
            <Text style={styles.editButtonText}>{editMode ? 'Done' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {/* Devices Display */}
        {activeTab === 'devices' ? (
          <ScrollView 
            contentContainerStyle={styles.deviceGrid}
            showsVerticalScrollIndicator={true}
          >
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
                  <MaterialCommunityIcons name={device.icon} size={40} color="#fffcf2" />
                  <Text style={styles.deviceName}>{device.name}</Text>
                </View>

                {device.name === 'Thermostat' && deviceStates[device.id] && !editMode && (
                  <View style={styles.tempControls}>
                    <TouchableOpacity onPress={() => decreaseTemperature(device.id)}>
                      <MaterialCommunityIcons name="minus-circle-outline" size={30} color="red" />
                    </TouchableOpacity>
                    <Text style={styles.tempText}>{temperatures[device.id] || 23}°C</Text>
                    <TouchableOpacity onPress={() => increaseTemperature(device.id)}>
                      <MaterialCommunityIcons name="plus-circle-outline" size={30} color="green" />
                    </TouchableOpacity>
                  </View>
                )}

                {device.name === 'Smart Light' && deviceStates[device.id] && !editMode && (
                  <View style={styles.brightnessControls}>
                    <TouchableOpacity onPress={() => decreaseBrightness(device.id)}>
                      <MaterialCommunityIcons name="minus-circle-outline" size={30} color="red" />
                    </TouchableOpacity>
                    <Text style={styles.brightnessText}>{brigntness[device.id] || 75}%</Text>
                    <TouchableOpacity onPress={() => increaseBrightness(device.id)}>
                      <MaterialCommunityIcons name="plus-circle-outline" size={30} color="green" />
                    </TouchableOpacity>
                  </View>
                )}

                {device.name === 'Roomba' && deviceStates[device.id] && !editMode && (
                  <View style={styles.roombaControls}>
                    <Text style={styles.roombaSpeed}>{roombaSpeed}</Text>
                    <TouchableOpacity onPress={cycleRoombaSpeed}>
                      <MaterialCommunityIcons name="reload" size={17} color="white" />
                    </TouchableOpacity>
                  </View>
                )}

                {device.name === 'TV' && deviceStates[device.id] && !editMode && (
                  <View style={styles.volumeControls}>
                    <TouchableOpacity onPress={() => decreaseVolume(device.id)}>
                      <MaterialCommunityIcons name="volume-minus" size={30} color="red" />
                    </TouchableOpacity>
                    <Text style={styles.volumeText}>{volume[device.id] || 10}</Text>
                    <TouchableOpacity onPress={() => increaseVolume(device.id)}>
                      <MaterialCommunityIcons name="volume-plus" size={30} color="green" />
                    </TouchableOpacity>
                  </View>
                )}

                {device.name === 'Washing Machine' && deviceStates[device.id] && !editMode && (
                  <View style={styles.controlPanel}>
                    <Text style={styles.washingStatus}>
                      {deviceStates[device.id] ? `Running: ${formatTime(timeLeft[device.id] || 0)}` : 'Off'}
                    </Text>
                    {deviceStates[device.id] && (
                      <TouchableOpacity 
                        style={styles.resetButton}
                        onPress={() => setTimeLeft(prev => ({ ...prev, [device.id]: 1200 }))}
                      >
                        <MaterialCommunityIcons name="restart" size={20} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {device.name === 'CCTV' && deviceStates[device.id] && !editMode && (
                  <View style={styles.controlPanel}>
                    <Text style={styles.controlText}>
                      {'Recording...'}
                    </Text>
                  </View>
                )}

                {!editMode && (
                  <Switch value={deviceStates[device.id]} onValueChange={() => toggleSwitch(device.id)} />
                )}
                <Text style={styles.deviceLocation}>{device.location}</Text>
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
                  {['Smart Light', 'Thermostat', 'CCTV', 'TV', 'Roomba', 'Washing Machine'].map((type) => (
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
      <NavBar />
    </View>
  );
};

export default DevicesPage;