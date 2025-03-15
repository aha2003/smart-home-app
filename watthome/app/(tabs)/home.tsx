
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Switch, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { styles as fileStyles } from "./LoginStyles";

// Sample data for users
const profilePictures = [
  { id: '1', uri: 'https://randomuser.me/api/portraits/women/1.jpg', name: 'Jessica' },
  { id: '2', uri: 'https://randomuser.me/api/portraits/men/2.jpg', name: 'Arthur' },
  { id: '3', uri: 'https://randomuser.me/api/portraits/men/3.jpg', name: 'Robert' },
  { id: '4', uri: 'https://randomuser.me/api/portraits/women/4.jpg', name: 'Delvey' },
  { id: '5', uri: 'https://randomuser.me/api/portraits/men/5.jpg', name: 'Toby' },
  { id: '6', uri: 'https://randomuser.me/api/portraits/women/6.jpg', name: 'Maria' },
  { id: '7', uri: 'https://randomuser.me/api/portraits/women/7.jpg', name: 'Belle' },
  { id: '8', uri: 'https://randomuser.me/api/portraits/men/8.jpg', name: 'Chris' },
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
          // <View style={localStyles.controlsContainer}>
          //   <Text style={localStyles.controlText}>{device.options ? device.options[device.value] : ''}</Text>
          //   <TouchableOpacity onPress={cycleRoombaSpeed}>
          //     <MaterialCommunityIcons name="reload" size={24} color="white" />
          //   </TouchableOpacity>
          // </View>

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

  // const renderDeviceStatus = () => {
  //   if (!deviceStates[device.id]) {
  //     return <Text style={localStyles.deviceStatus}>Off</Text>;
  //   }

  //   switch (device.type) {
  //     case 'temperature':
  //       return <Text style={localStyles.deviceStatus}>{device.value}°C</Text>;
  //     case 'brightness':
  //       return <Text style={localStyles.deviceStatus}>{device.value}%</Text>;
  //     case 'volume':
  //       return <Text style={localStyles.deviceStatus}>Volume: {device.value}</Text>;
  //     case 'speed':
  //       return <Text style={localStyles.deviceStatus}>{device.options ? device.options[device.value] : ''}</Text>;
  //     default:
  //       return <Text style={localStyles.deviceStatus}>On</Text>;
  //   }
  // };

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
        
        {/* Users Section */}
        <View style={[localStyles.section, isDesktop ? localStyles.desktop_section : localStyles.mobile_section]}>
          <Text style={fileStyles.usersTitle}> Users</Text>
          <ScrollView 
            ref={userScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={localStyles.usersContainer}
          >
            {profilePictures.map((profile) => (
              <View key={profile.id} style={localStyles.profileContainer}>
                <Image source={{ uri: profile.uri }} style={localStyles.profilePicture} />
                <Text style={localStyles.profileName}>{profile.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        
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
        <View style={localStyles.leaderboard}>
          <Text style={localStyles.leaderboardTitle}>Weekly Leaderboard</Text>
          <View style={localStyles.leaderboardContent}>
            <View style={localStyles.leaderboardItem}>
              <View style={[localStyles.rankBadge, localStyles.secondRank]}>
                <Text style={localStyles.rankText}>2</Text>
              </View>
              <Image source={{ uri: profilePictures[1].uri }} style={localStyles.leaderboardImage} />
              <Text style={localStyles.leaderboardName}>{profilePictures[1].name}</Text>
              <Text style={localStyles.leaderboardPoints}>1269 pts</Text>
            </View>
            
            <View style={[localStyles.leaderboardItem, localStyles.firstPlace]}>
              <View style={[localStyles.rankBadge, localStyles.firstRank]}>
                <Text style={localStyles.rankText}>1</Text>
              </View>
              <Image source={{ uri: profilePictures[0].uri }} style={[localStyles.leaderboardImage, localStyles.firstImage]} />
              <Text style={localStyles.leaderboardName}>{profilePictures[0].name}</Text>
              <Text style={localStyles.leaderboardPoints}>1734 pts</Text>
            </View>
            
            <View style={localStyles.leaderboardItem}>
              <View style={[localStyles.rankBadge, localStyles.thirdRank]}>
                <Text style={localStyles.rankText}>3</Text>
              </View>
              <Image source={{ uri: profilePictures[2].uri }} style={localStyles.leaderboardImage} />
              <Text style={localStyles.leaderboardName}>{profilePictures[2].name}</Text>
              <Text style={localStyles.leaderboardPoints}>1072 pts</Text>
            </View>
          </View>
        </View>
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
  desktop_section: {
    paddingVertical: 10,
    justifyContent: 'center',
    width: 710,
  },
  roomSection: {
    marginBottom: 25,
    backgroundColor: '#001322',
    opacity: 0.85,
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
  },
  profileContainer: {
    alignItems: 'center',
    marginRight: 15,
    paddingBottom: 10,
  },
  profilePicture: {
    width: 80,
    height: 80,
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
    backgroundColor: '#98999e',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#D49C6E',
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
  },
  roomCard: {
    //width: Dimensions.get('window').width * 0.85,
    width: 335,
    marginRight: 20,
    //margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 19, 34, 0.89)', // Matching your login card background
    //flexDirection: 'column',

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
    marginLeft: 10,
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























  leaderboard: {
    backgroundColor: 'rgba(0, 19, 34, 0.89)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  leaderboardTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leaderboardContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  leaderboardItem: {
    alignItems: 'center',
    position: 'relative',
  },
  firstPlace: {
    marginTop: -20,
    zIndex: 1,
  },
  leaderboardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#DDDDDD',
  },
  firstImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: 'gold',
    borderWidth: 3,
  },
  leaderboardName: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  leaderboardPoints: {
    fontSize: 12,
    color: '#D49C6E',
    fontWeight: 'bold',
  },
  rankBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  firstRank: {
    backgroundColor: 'gold',
  },
  secondRank: {
    backgroundColor: 'silver',
  },
  thirdRank: {
    backgroundColor: '#CD7F32', // bronze
  },
  rankText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#000',
  },

  
});

export default HomeTest;