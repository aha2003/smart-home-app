
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Switch, Platform, Modal, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { styles as fileStyles } from "./LoginStyles";



// NavBar Component
const NavBar = () => {
  return (
    <View style={[fileStyles.navBar, Platform.OS === 'web' ? fileStyles.desktopNav : fileStyles.mobileNav]}>
      <Link href="/home" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="home-outline" 
            size={49} 
            color="white" 
            style={fileStyles.glowIcon}
          />
        </TouchableOpacity>
      </Link>

      <Link href="/devices" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="devices" 
            size={35} 
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

// Sample data for users
const profilePictures = [
  { id: '1', uri: 'https://randomuser.me/api/portraits/women/49.jpg', name: 'Jessica', score: 1734 },
  { id: '2', uri: 'https://randomuser.me/api/portraits/men/12.jpg', name: 'Arthur' , score: 1269},
  { id: '3', uri: 'https://randomuser.me/api/portraits/men/43.jpg', name: 'Robert' , score: 1072},
  { id: '4', uri: 'https://randomuser.me/api/portraits/women/34.jpg', name: 'Delvey' , score: 987},
  { id: '5', uri: 'https://randomuser.me/api/portraits/men/50.jpg', name: 'Toby' ,score: 845},
  { id: '6', uri: 'https://randomuser.me/api/portraits/women/62.jpg', name: 'Maria' , score: 764},
  { id: '7', uri: 'https://randomuser.me/api/portraits/women/57.jpg', name: 'Belle' , score: 623},
  { id: '8', uri: 'https://randomuser.me/api/portraits/men/68.jpg', name: 'Chris', score: 212 },
];

// Sample data for rooms
const rooms = [
  {
    id: '1',
    name: 'Living Room',
    image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=400&h=300&fit=crop',
    devices: [
      { id: 'ac1', name: 'Thermostat', type: 'temperature', value: 23, icon: 'thermometer' },
      { id: 'light1', name: 'Smart Light', type: 'brightness', value: 75, icon: 'lightbulb-outline' }
    ]
  },
  {
    id: '2',
    name: 'Master Bedroom',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop',
    devices: [
      { id: 'tv1', name: ' TV', type: 'volume', value: 10, icon: 'television' },
      { id: 'light2', name: 'Smart Light', type: 'brightness', value: 75, icon: 'lightbulb-outline' }
    ]
  },
  {
    id: '3',
    name: 'Kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop',
    devices: [
      { id: 'roomba1', name: 'Roomba', type: 'speed', value: 2, options: ['Low', 'Medium', 'High'], icon: 'robot-vacuum' },
      { id: 'ac2', name: 'Thermostat', type: 'temperature', value: 23, icon: 'thermometer' }
    ]
  },
];

// Device Card Component
interface Device {
  id: string;
  name: string;
  type: string;
  value: number;
  icon: string;
  options?: string[];
}

const DeviceCard = ({ device, deviceStates, onToggle, onValueChange }: { device: Device, deviceStates: { [key: string]: boolean }, onToggle: (id: string) => void, onValueChange: (id: string, value: number) => void }) => {
  const [editMode, setEditMode] = useState(false);
  
 // Functions to handle specific device controls
  const decreaseBrightness = (deviceId: string) => {
    onValueChange(deviceId, Math.max(device.value - 5, 0));
  };

  const increaseBrightness = (deviceId: string) => {
    onValueChange(deviceId, Math.min(device.value + 5, 100));
  };

  const decreaseTemperature = (deviceId: string) => {
    onValueChange(deviceId, Math.max(device.value - 1, 16));
  };

  const increaseTemperature = (deviceId: string) => {
    onValueChange(deviceId, Math.min(device.value + 1, 30));
  };

  const decreaseVolume = (deviceId: string) => {
    onValueChange(deviceId, Math.max(device.value - 1, 0));
  };

  const increaseVolume = (deviceId: string) => {
    onValueChange(deviceId, Math.min(device.value + 1, 100));
  };

  const [roombaSpeed, setRoombaSpeed] = useState('Medium');

  const cycleRoombaSpeed = () => {
    const speeds = ['Low', 'Medium', 'High'];
    const currentIndex = speeds.indexOf(roombaSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setRoombaSpeed(speeds[nextIndex]);
  };



  const renderSpecificControls = () => {
    if (!deviceStates[device.id] || editMode) return null;

    if (device.name.includes('Light') || device.name.includes('Bulb')) {
      return (
          <View style={localStyles.controlsContainer}>
            <TouchableOpacity onPress={() => decreaseBrightness(device.id)}>
              <MaterialCommunityIcons name="minus-circle-outline" size={30} color="#FF4444" />
            </TouchableOpacity>
            <Text style={localStyles.controlText}>{device.value}%</Text>
            <TouchableOpacity onPress={() => increaseBrightness(device.id)}>
              <MaterialCommunityIcons name="plus-circle-outline" size={30} color="#44FF44" />
            </TouchableOpacity>
          </View>
      );
    }
    
    if (device.name.includes('AirCon') || device.name.includes('Thermostat') || device.name.includes('Oven')) {
      return (

          <View style={localStyles.controlsContainer}>
            <TouchableOpacity onPress={() => decreaseTemperature(device.id)}>
              <MaterialCommunityIcons name="minus-circle-outline" size={30} color="#FF4444" />
            </TouchableOpacity>
            <Text style={localStyles.controlText}>{device.value}°C</Text>
            <TouchableOpacity onPress={() => increaseTemperature(device.id)}>
              <MaterialCommunityIcons name="plus-circle-outline" size={30} color="#44FF44" />
            </TouchableOpacity>
          </View>

      );
    }

    
    if (device.name.includes('TV') || device.name.includes('Speaker')) {
      return (
          <View style={localStyles.controlsContainer}>
            <TouchableOpacity onPress={() => decreaseVolume(device.id)}>
              <MaterialCommunityIcons name="volume-minus" size={30} color="#FF4444" />
            </TouchableOpacity>
            <Text style={localStyles.controlText}>{device.value}</Text>
            <TouchableOpacity onPress={() => increaseVolume(device.id)}>
              <MaterialCommunityIcons name="volume-plus" size={30} color="#44FF44" />
            </TouchableOpacity>
          </View>
      );
    }
    
    if (device.name === 'Roomba') {
      return (
        <View style={localStyles.controlsContainer}>
          <Text style={localStyles.controlText}>{roombaSpeed}</Text>
          <TouchableOpacity onPress={cycleRoombaSpeed}>
            <MaterialCommunityIcons name="reload" size={17} color="white" />
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };


  return (
    <View style={localStyles.device_inside_card}>
      <View style={localStyles.deviceHeader}>
        <MaterialCommunityIcons name={device.icon} size={32} color="#FFFFFF" />
        <Text style={localStyles.deviceName}>{device.name}</Text>
      </View>
      <Switch
        value={deviceStates[device.id] || false}
        onValueChange={() => onToggle(device.id)}
        style={localStyles.toggleSwitch}
      />
      {renderSpecificControls()}
    </View>
  );
};

const WeatherWidget = () => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 30, description: "Sunny" });

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather data every 5 minutes
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Dubai&units=metric&appid=922d65e11285d69e0edf2586f08a9d11`
        );
        const data = await response.json();
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].main,
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = time.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const getWeatherIcon = () => {
    const desc = weather.description.toLowerCase();
    if (desc.includes('cloudy')) return { name:'weather-cloudy', color: '#b7b9bd'};
    if (desc.includes('partly cloudy'))  return { name: 'weather-partly-cloudy', color: '#c3d980' };
    if (desc.includes('rain'))  return { name: 'weather-rainy', color: '#4eb9f2' };;
    if (desc.includes('snow')) return { name: 'weather-snowy', color: '#E0E0E0' };;
    if (desc.includes('thunder')) return { name: 'weather-lightning', color: '#5B80A5' };
    if (desc.includes('fog') || desc.includes('mist')) return { name: 'weather-fog', color: '#B8C5D6' };
    if (desc.includes('sun') || desc.includes('clear')) return { name: 'white-balance-sunny', color: '#FFC107' };
    return { name: 'white-balance-sunny', color: '#FFC107' };
  };

  const isDesktop = Platform.OS === 'web';

  return (
    <View style={[localStyles.weatherWidgetContainer, isDesktop ? localStyles.WeatherWidget_desktop : localStyles.WeatherWidget_mobile]}>
      {/* Background Image with Opacity */}
      <Image
        source={require('./cloud.png')}
        style={localStyles.weatherBackgroundImage}
      />
      <View style={localStyles.weatherWidgetContent}>
        <View style={localStyles.weatherIconContainer}>
          <MaterialCommunityIcons name={getWeatherIcon()?.name || 'white-balance-sunny'} size={47} color={getWeatherIcon()?.color || '#FFC107'} />
        </View>
        <View style={localStyles.weatherInfo}>
          <Text style={localStyles.weatherLocation}>Dubai</Text>
          <Text style={localStyles.weatherTemp}>{weather.temp}°C, {weather.description}</Text>
        </View>
        <View style={localStyles.weatherTime}>
          <Text style={localStyles.timeText}>{formattedTime}</Text>
          <Text style={localStyles.dateText}>{formattedDate}</Text>
        </View>
      </View>
    </View>
  );
};

// Room Card Component
const RoomCard = ({ room }) => {
  const [deviceStates, setDeviceStates] = useState<{ [key: string]: boolean }>({});
  const [deviceValues, setDeviceValues] = useState<{ [key: string]: number }>({});

  // Initialize device values
  useEffect(() => {
    const initialValues = {};
    room.devices.forEach((device: Device) => {
      initialValues[device.id] = device.value;
    });
    setDeviceValues(initialValues);
  }, []);

  const handleToggle = (deviceId: string) => {
    setDeviceStates(prev => ({
      ...prev,
      [deviceId]: !prev[deviceId]
    }));
  };

  const handleValueChange = (deviceId: string, newValue: number) => {
    setDeviceValues(prev => ({
      ...prev,
      [deviceId]: newValue
    }));
    
    // Update the device value in the room data
    const deviceIndex = room.devices.findIndex((d: Device) => d.id === deviceId);
    if (deviceIndex !== -1) {
      room.devices[deviceIndex].value = newValue;
    }
  };

  return (
    <View style={localStyles.roomCard}>
      <Image source={{ uri: room.image }} style={localStyles.roomImage} />
      <View style={localStyles.roomContent}>
        <Text style={localStyles.roomName}>{room.name}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={localStyles.devicesScrollView}>
          <View style={localStyles.devicesContainer}>
            {room.devices.map((device: Device) => (
              <DeviceCard
                key={device.id}
                device={device}
                deviceStates={deviceStates}
                onToggle={handleToggle}
                onValueChange={handleValueChange}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// Main Component
const HomeTest = () => {
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const roomsScrollRef = useRef<ScrollView>(null);
  const userScrollRef = useRef(null);
  
  const screenWidth = Dimensions.get('window').width;
  const roomItemWidth = screenWidth * 0.85 + 20;
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [passkey, setPasskey] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

// Add function to generate a 6-digit passkey
  const generatePasskey = () => {
    const randomPasskey = Math.floor(100000 + Math.random() * 900000).toString();
    setPasskey(randomPasskey);
  };

  // Add function to handle room selection
  const handleRoomSelection = (roomId: string) => {
    setSelectedRooms(prev => {
      const isSelected = prev.includes(roomId);
      
      // Get devices from this room
      const roomDevices = rooms.find(room => room.id === roomId)?.devices || [];
      
      if (isSelected) {
        // If deselecting the room, remove all its devices from selectedDevices
        setSelectedDevices(prev => 
          prev.filter(deviceId => !roomDevices.some(device => device.id === deviceId))
        );
        return prev.filter(id => id !== roomId);
      } else {
        // If selecting the room, don't automatically add devices to selectedDevices
        return [...prev, roomId];
      }
    });
  };


  // Add function to handle device selection
  const handleDeviceSelection = (deviceId: string) => {
    setSelectedDevices(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

// Add function to handle form submission


  const availableRooms = [
    { id: '1', name: 'Living Room' },
    { id: '2', name: 'Kitchen' },
    { id: '3', name: 'Master Bedroom' },
    { id: '4', name: 'Kids Room' },
    { id: '5', name: 'Grandparents Room' }
  ];
  
  const availableDevices = [
    { id: 'd1', name: 'Smart Light', icon: 'lightbulb-outline' },
    { id: 'd2', name: 'Thermostat', icon: 'thermometer' },
    { id: 'd3', name: 'CCTV', icon: 'cctv' },
    { id: 'd4', name: 'TV', icon: 'television' },
    { id: 'd5', name: 'Roomba', icon: 'robot-vacuum' },
    { id: 'd6', name: 'Washing Machine', icon: 'washing-machine' },
    { id: 'd7', name: 'Pill Dispenser', icon: 'pill' }
  ];
  
  // In the HomeTest component, add these state variables
  const [addUserStep, setAddUserStep] = useState(1); // 1: Name & Passkey, 2: Rooms, 3: Devices
  


// Update the resetForm function
  const resetForm = () => {
    setNewUserName('');
    setPasskey('');
    setSelectedRooms([]);
    setSelectedDevices([]);
    setShowAddUserForm(false);
    setAddUserStep(1); // Reset step to 1
  };


    // Add this function to handle going to the next step
  const goToNextStep = () => {
    if (addUserStep === 1) {
      if (!newUserName.trim()) {
        Alert.alert('Error', 'Please enter a user name');
        return;
      }
      
      if (!passkey) {
        Alert.alert('Error', 'Please generate a passkey');
        return;
      }
      
      setAddUserStep(2);
    } else if (addUserStep === 2) {
      if (selectedRooms.length === 0) {
        Alert.alert('Error', 'Please select at least one room');
        return;
      }
      
      setAddUserStep(3);
    }
  };


  const renderAddUserForm = () => {
    return (
      <Modal
        visible={showAddUserForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddUserForm(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.addUserFormContainer}>
            <Text style={localStyles.addUserFormTitle}>
              {addUserStep === 1 ? 'Configure New User' : 
               addUserStep === 2 ? 'Select Rooms' : 'Select Devices'}
            </Text>
            
            {/* Step 1: User Info */}
            {addUserStep === 1 && (
              <>
                <Text style={localStyles.formLabel}>User Name</Text>
                <TextInput
                  style={localStyles.formInput}
                  value={newUserName}
                  onChangeText={setNewUserName}
                  placeholder="Enter user name"
                  placeholderTextColor="#999"
                />

              <View style={localStyles.passkeyContainer}>
                <Text style={localStyles.formLabel}>Passkey</Text>
                <View style={localStyles.passkeyRow}>
                  <TextInput
                    style={localStyles.passkeyInput}
                    value={passkey}
                    editable={false}
                    placeholder="Generate a 6-digit passkey"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity 
                    style={localStyles.generateButton}
                    onPress={generatePasskey}
                  >
                    <MaterialCommunityIcons name="refresh" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* Step 2: Room Selection */}
          {addUserStep === 2 && (
            <>
              <Text style={[localStyles.formLabel, { textAlign: 'center' }]}>
                Select rooms the user will have access to
              </Text>
              <ScrollView style={localStyles.checklistContainer}>
                {availableRooms.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      localStyles.checklistItem,
                      selectedRooms.includes(room.id) && localStyles.selectedChecklistItem
                    ]}
                    onPress={() => {
                      // Toggle room selection
                      if (selectedRooms.includes(room.id)) {
                        setSelectedRooms(prev => prev.filter(id => id !== room.id));
                      } else {
                        setSelectedRooms(prev => [...prev, room.id]);
                      }
                    }}>

                    <View style={localStyles.checkBox}>
                      {selectedRooms.includes(room.id) && (
                        <MaterialCommunityIcons name="check" size={20} color="white" />
                      )}
                    </View>
                    
                    <Text style={localStyles.checklistText}>{room.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

           {/* Step 3: Device Selection */}
           {addUserStep === 3 && (
            <>
              <Text style={[localStyles.formLabel, { textAlign: 'center' }]}>
                Select devices the user will have access to
              </Text>
              <ScrollView style={localStyles.checklistContainer}>
                {availableDevices.map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    style={[
                      localStyles.checklistItem,
                      selectedDevices.includes(device.id) && localStyles.selectedChecklistItem
                    ]}
                    onPress={() => {
                      // Toggle device selection
                      if (selectedDevices.includes(device.id)) {
                        setSelectedDevices(prev => prev.filter(id => id !== device.id));
                      } else {
                        setSelectedDevices(prev => [...prev, device.id]);
                      }
                    }}
                  >
                    <View style={localStyles.checkBox}>
                      {selectedDevices.includes(device.id) && (
                        <MaterialCommunityIcons name="check" size={20} color="white" />
                      )}
                    </View>
                    <View style={localStyles.deviceItemContent}>
                      <MaterialCommunityIcons 
                        name={device.icon} 
                        size={20} 
                        color={selectedDevices.includes(device.id) ? "#fff" : "#c3c4c5"} 
                      />
                      <Text style={localStyles.checklistText}>{device.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Form Buttons */}
          <View style={localStyles.formButtons}>
            {/* Back button - only show on steps 2 and 3 */}
            {addUserStep > 1 ? (
              <TouchableOpacity 
                style={localStyles.cancelButton}
                onPress={() => setAddUserStep(prev => prev - 1)}
              >
                <Text style={localStyles.cancelButtonText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={localStyles.cancelButton}
                onPress={resetForm}
              >
                <Text style={localStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            
            {/* Next/Configure button */}
            <TouchableOpacity 
              style={localStyles.addButton}
              onPress={addUserStep < 3 ? goToNextStep : handleAddUser}
            >
              <Text style={localStyles.addButtonText}>
                {addUserStep < 3 ? 'Next' : 'Configure'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


// Update the handleAddUser function
const handleAddUser = () => {
  if (selectedDevices.length === 0) {
    Alert.alert('Error', 'Please select at least one device');
    return;
  }

  if (Platform.OS === 'web') {
    resetForm();

    // Then show the confirmation dialog
    setTimeout(() => {
      alert(`User Configured\nName: ${newUserName}\nPasskey: ${passkey}\nAccess granted to ${selectedRooms.length} rooms and ${selectedDevices.length} devices.`);
    }, 100);
  } else {
  // Here you would typically send this data to a backend service
  Alert.alert(
    'User Configured',
    `Name: ${newUserName}\nPasskey: ${passkey}\nAccess granted to ${selectedRooms.length} rooms and ${selectedDevices.length} devices.`,
    [{ text: 'OK', onPress: resetForm }]
  );
  }
};
                   


  // Room indicators component
  const renderRoomIndicators = () => {
    return (
      <View style={localStyles.indicatorContainer}>
        {rooms.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToRoom(index)}
            style={[
              localStyles.indicator,
              activeRoomIndex === index ? localStyles.activeIndicator : {}
            ]}
          />
        ))}
      </View>
    );
  };

  // Scroll to specific room
  const scrollToRoom = (index: number) => {
    if (roomsScrollRef.current) {
      roomsScrollRef.current.scrollTo({
        x: index * roomItemWidth,
        animated: true
      });
    }
    setActiveRoomIndex(index);
  };

  // Handle room scroll events
  const handleRoomScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / roomItemWidth);
    if (index !== activeRoomIndex && index >= 0 && index < rooms.length) {
      setActiveRoomIndex(index);
    }
  };

  const isDesktop = Platform.OS === 'web';

  return (
    <View style={[localStyles.container, isDesktop ? localStyles.desktop_container : localStyles.mobile_container]}>
      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        <View style={[localStyles.titleContainer, isDesktop ? localStyles.desktop_titleContainer : localStyles.mobile_titleContainer]}>
          <Text style={fileStyles.Home_title}>Hi Jessica,</Text>
          <Text style={fileStyles.subtitle}> Welcome Home!</Text>
        </View>

        <View style={[localStyles.first_section, isDesktop ? localStyles.first_desktop_section : localStyles.first_mobile_section]}>
          {/* Weather Widget */}
          <WeatherWidget />
          


          {/* Users Section */}
          <View style={[localStyles.section, isDesktop ? localStyles.desktop_section : localStyles.mobile_section]}>
            <Text style={fileStyles.usersTitle}> Users</Text>
            <ScrollView 
              ref={userScrollRef}
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={isDesktop ? localStyles.usersContainerDesktop : localStyles.usersContainerMobile}
            >
              {profilePictures.map((profile) => (
                <View key={profile.id} style={localStyles.profileContainer}>
                  <Image source={{ uri: profile.uri }} style={localStyles.profilePicture} />
                  <Text style={localStyles.profileName}>{profile.name}</Text>
                </View>
              ))}
              
              {/* Add User Button */}
              <TouchableOpacity 
                style={localStyles.addUserButton}
                onPress={() => setShowAddUserForm(true)}
              >
                <View style={localStyles.addUserCircle}>
                  <MaterialCommunityIcons name="plus" size={30} color="#000000" />
                </View>
                <Text style={localStyles.addUserText}>Add User</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Render the modal form */}
          {renderAddUserForm()}



        </View>

        <View style={[localStyles.second_section, isDesktop ? localStyles.second_desktop_section : localStyles.second_mobile_section]}>

          {/* Rooms Section */}
          <View style={[localStyles.roomSection, isDesktop ? localStyles.desktop_room_section : localStyles.mobile_room_section]}>
            <View style={localStyles.roomsHeader}>
              <Text style={fileStyles.usersTitle}>Rooms</Text>
              <View style={localStyles.roomNav}>
                <TouchableOpacity 
                  style={localStyles.navButton}
                  onPress={() => scrollToRoom(Math.max(0, activeRoomIndex - 1))}
                  disabled={activeRoomIndex === 0}
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={28}
                    color={activeRoomIndex === 0 ? "#555" : "#ffffff"}
                  />
                </TouchableOpacity>
                
                {renderRoomIndicators()}
                
                <TouchableOpacity
                  style={localStyles.navButton}
                  onPress={() => scrollToRoom(Math.min(rooms.length - 1, activeRoomIndex + 1))}
                  disabled={activeRoomIndex === rooms.length - 1}
                >
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={28}
                    color={activeRoomIndex === rooms.length - 1 ? "#555" : "#ffffff"}
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView 
              ref={roomsScrollRef}
              horizontal 
              showsHorizontalScrollIndicator={false}
              onScroll={handleRoomScroll}
              scrollEventThrottle={16}
              pagingEnabled={false}
              snapToInterval={roomItemWidth}
              decelerationRate="fast"
              snapToAlignment="center"
              contentContainerStyle={localStyles.roomsContainer}
            >
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </ScrollView>
          </View>

          {/* Leaderboard Section */}
          <View style={[localStyles.leaderboard, isDesktop ? localStyles.leaderboard_desktop : localStyles.leaderboard_mobile]}>
            <Text style={localStyles.leaderboardTitle}>Weekly Leaderboard</Text>
  
            {/* Top 3 Users */}
            <View style={localStyles.leaderboardTop}>
              {/* Second Place */}
              <View style={[localStyles.leaderboardItem]}>
                <View style={localStyles.crownContainer}>
                  <MaterialCommunityIcons name="crown" size={24} color="#C0C0C0" />
                </View>
                <Image source={{ uri: profilePictures[1].uri }} style={localStyles.secondImage} />
                <Text style={localStyles.leaderboardName}>{profilePictures[1].name}</Text>
                <Text style={localStyles.leaderboardPoints}>{profilePictures[1].score} pts</Text>
              </View>
    
              {/* First Place */}
              <View style={[localStyles.leaderboardItem, localStyles.firstPlace]}>
                <View style={localStyles.crownContainer}>
                  <MaterialCommunityIcons name="crown" size={28} color="#FFD700" />
                </View>
                <Image source={{ uri: profilePictures[0].uri }} style={[localStyles.leaderboardImage, localStyles.firstImage]} />
                <Text style={localStyles.leaderboardName}>{profilePictures[0].name}</Text>
                <Text style={localStyles.leaderboardPoints}>{profilePictures[0].score} pts</Text>
              </View>
    
                {/* Third Place */}
                <View style={localStyles.leaderboardItem}>
                  <View style={localStyles.crownContainer}>
                    <MaterialCommunityIcons name="crown" size={24} color="#CD7F32" />
                  </View>
                  <Image source={{ uri: profilePictures[2].uri }} style={localStyles.thirdImage} />
                  <Text style={localStyles.leaderboardName}>{profilePictures[2].name}</Text>
                  <Text style={localStyles.leaderboardPoints}>{profilePictures[2].score} pts</Text>
                </View>
              </View>

              {/* Other Users (4th and 5th only) */}
              <View style={localStyles.leaderboardList}>
                {profilePictures.slice(3, 5).map((user, index) => (
                  <View key={user.id} style={localStyles.leaderboardListItem}>
                    <View style={localStyles.leaderboardListLeft}>
                      <Text style={localStyles.leaderboardRank}>{index + 4}</Text>
                      <Image source={{ uri: user.uri }} style={localStyles.leaderboardListImage} />
                      <Text style={localStyles.leaderboardListName}>{user.name}</Text>
                    </View>
                    <Text style={localStyles.leaderboardListPoints}>{user.score} pts</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        {/* second section view */}
      </ScrollView>
      <NavBar />
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5efeb', // Matching your other pages
    position: 'relative',
    //marginLeft: 60,
  },

  titleContainer: {
    //flexDirection: 'row', // Align children horizontally
    alignItems: 'center', // Vertically center the text
    //gap: 10, // Add spacing between the two texts (optional)
  },
  desktop_titleContainer: {  
    flexDirection: 'row', // Align children horizontally 
    //paddingHorizontal: 20,
    //paddingVertical: 10,
  },
  mobile_titleContainer: {
    flexDirection: 'column',
    //paddingHorizontal: 20,
    //paddingVertical: 10,
  },

  mobile_container: {
    //width: '100%',
    flex: 1,
    backgroundColor: '#f5efeb',
    position: 'relative',
  },

  desktop_container: {
    flex: 1,
    backgroundColor: '#f5efeb',
    position: 'relative',
    marginLeft: 60,
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: 10, // Space for bottom navbar
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#001322',
    //opacity: 0.95,
    borderRadius: 20,
    paddingLeft: 20,
    paddingRight: 20,
    //width: 358,
  },
  mobile_section: { 
    //paddingVertical: 15,
    width: '100%',
  },

  //usersectiondesktop
  desktop_section: {
    //paddingVertical: 10,
    paddingLeft: 20,
    justifyContent: 'center',
    width: 630,
    marginLeft: 20,
  },
  roomSection: {
    marginBottom: 25,
    backgroundColor: '#001322',
    //opacity: 0.9,
    borderRadius: 20,
    paddingLeft: 4,
  },
  desktop_room_section: {
    width: 710,
  },
  mobile_room_section: {
    width: '100%',
  },
  usersContainerMobile: {
    paddingVertical: 15,
  },
  usersContainerDesktop: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    //width: 100,
  },
  profileContainer: {
    alignItems: 'center',
    marginRight: 15,
    paddingBottom: 10,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 40,
    // borderWidth: 2,
    // borderColor: '#D49C6E', // Match your app's accent color
  },
  profileName: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 5,
    textAlign: 'center',
  },
  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  roomNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 5,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c3c4c5',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#ffffff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  roomsContainer: {
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 20,
    flexDirection: 'row',
    //width: 200,
    paddingBottom: 15,
  },
  roomCard: {
    //width: Dimensions.get('window').width * 0.85,
    width: 335,
    marginRight: 20,
    //margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1d2936',
    //backgroundColor: 'rgba(0, 19, 34, 0.5)', // Matching your login card background
    //flexDirection: 'column',
   //paddingBottom: 10,

  },
  roomImage: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
  },

  roomContent: {
    padding: 2,
  },
  roomName: {
    padding: 7,
    paddingLeft: 15,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  devicesScrollView: {
    flexDirection: 'row',
  },
  devicesContainer: {
    gap: 3,
    flexDirection: 'row',
    paddingLeft: 10,
    // flexWrap: 'wrap',
    justifyContent: 'space-around',
    // width: 100,
  },
  deviceStatus: {
    fontSize: 18,
    color: '#D49C6E',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
  brightnessControls: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    //marginVertical: 0,
    //width : 60,
  },
  brightnessText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  volumeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },

  roombaControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  roombaSpeed: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },

  deviceCard: {
    width: 180,
    backgroundColor: '#001322',
    opacity: 1.95,
    //backgroundColor: 'rgba(0, 19, 34, 0.89)',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
    flexDirection: 'row',

  },
  
  device_inside_card: {
    backgroundColor: '#001322',
    padding: 15,
    borderRadius: 20,
    width: 130,
    margin: 10,
    justifyContent: 'space-around',
    //flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#001322',
  },

  toggleSwitch: {
    alignSelf: 'center',
    marginBottom: 10,
  },

  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  deviceName: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 5,
    marginRight: 7,
  },

  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginHorizontal: 10,
  },

  // Weather Widget Styles
  weatherWidget: {
    backgroundColor: '#001322',
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-around',
    //width: 710,
  },

  weatherWidgetContainer: {
  backgroundColor: '#001322',
  borderRadius: 20,
  marginBottom: 25,
  position: 'relative', // Important for absolute positioning of children
  overflow: 'hidden', // So the image doesn't go outside the rounded corners
  width: '100%', // Ensure it takes full width
  height: 160, // Set a fixed height
  },
  
  weatherBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.3, // Adjust transparency
    // backgroundSize: 'cover',
    // backgroundPosition: 'center',
    // backgroundRepeat: 'no-repeat',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  
  weatherWidgetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
    //padding: 15,
    zIndex: 1, // Make sure content is above the background image
  },

  WeatherWidget_desktop: {
    width: 710,
  },
  WeatherWidget_mobile: {
    width: '100%',
  },
  weatherIconContainer: {
    padding: 10,
  },
  weatherInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  weatherLocation: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  weatherTemp: {
    color: '#ffffff',
    fontSize: 22,
  },
  weatherTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    paddingRight: 10,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 20,
    opacity: 0.8,
    paddingRight: 10,
  },

  first_section: {  
    marginBottom: 15,
  },

  first_mobile_section: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',

    width: '100%',
  },
  first_desktop_section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 710,
  },

  second_section: {
    marginBottom: 15,
    //backgroundColor: 'red',
  },
  second_mobile_section: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  second_desktop_section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 710,
  },




  leaderboard: {
    backgroundColor: 'rgba(0, 19, 34, 1)',
    borderRadius: 20,
    marginTop: 20,
    height: 440,
    margin: 20,
    paddingVertical: 20,
  },
  leaderboard_mobile: {
    width: '100%',
  },
  leaderboard_desktop: {
    width: 630,
    marginBottom: 40,
  },
  leaderboardTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leaderboardTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  leaderboardItem: {
    alignItems: 'center',
    position: 'relative',
  },


  crownContainer: {
  position: 'absolute',
  top: -15,
  zIndex: 2,
  },
  firstPlace: {
    marginBottom: 20,
    zIndex: 1,
  },
  leaderboardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  firstImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  secondImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderColor: '#C0C0C0',
    borderWidth: 2,
  },
  thirdImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderColor: '#CD7F32',
    borderWidth: 2,
  },
  leaderboardName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },

  leaderboardPoints: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  leaderboardList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    marginTop: 10,
    marginHorizontal: 20,
    padding: 10,
  },
  leaderboardListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  leaderboardListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.8,
    width: 30,
  },

  leaderboardListImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  leaderboardListName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  leaderboardListPoints: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },  



  // Add User Button Styles
addUserButton: {
  alignItems: 'center',
  marginRight: 15,
  paddingBottom: 10,
},
addUserCircle: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#ffffff',
  justifyContent: 'center',
  alignItems: 'center',
},
addUserText: {
  fontSize: 12,
  color: 'black',
  marginTop: 5,
  textAlign: 'center',
},

// Modal Form Styles
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
addUserFormContainer: {
  width: '90%',
  maxWidth: 500,
  backgroundColor: '#001322',
  borderRadius: 20,
  padding: 20,
  maxHeight: '90%',
},
addUserFormTitle: {
  fontSize: 24,
  color: '#FFFFFF',
  fontWeight: 'bold',
  marginBottom: 20,
  textAlign: 'center',
},
formLabel: {
  fontSize: 16,
  color: '#FFFFFF',
  marginTop: 15,
  marginBottom: 8,
},
formInput: {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 10,
  padding: 12,
  fontSize: 16,
  color: '#FFFFFF',
},
passkeyContainer: {
  marginTop: 15,
},
passkeyRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
passkeyInput: {
  flex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 10,
  padding: 12,
  fontSize: 16,
  color: '#FFFFFF',
  marginRight: 10,
},
generateButton: {
  //backgroundColor: '#001322',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  // borderWidth: 2,
  // borderColor: 'white',
  borderRadius: 10,
  padding: 12,
  alignItems: 'center',
  justifyContent: 'center',
},
checklistContainer: {
  maxHeight: 150,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 10,
  padding: 5,
},
checklistItem: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
},
selectedChecklistItem: {
  backgroundColor: 'c3c4c5',
  borderRadius: 8,
},
checkBox: {
  width: 24,
  height: 24,
  borderRadius: 4,
  borderWidth: 2,
  borderColor: 'white',
  marginRight: 10,
  justifyContent: 'center',
  alignItems: 'center',
},
deviceItemContent: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
checklistText: {
  color: '#FFFFFF',
  fontSize: 16,
  marginLeft: 10,
},
formButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 25,
},
cancelButton: {
  flex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 10,
  padding: 15,
  alignItems: 'center',
  marginRight: 10,
},
cancelButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
},
addButton: {
  flex: 1,
  // backgroundColor: '#001322',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  // borderWidth: 2,
  // borderColor: 'white',
  borderRadius: 10,
  padding: 15,
  alignItems: 'center',
},
addButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
},





  
});

export default HomeTest;