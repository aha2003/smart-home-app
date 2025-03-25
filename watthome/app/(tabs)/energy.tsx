import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, Dimensions, ScrollView, useWindowDimensions, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { StackedBarChart } from 'react-native-chart-kit';
import { styles } from "./LoginStyles";
import Chatbot from './chatbot';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { getAuth } from "firebase/auth";
import { collection, getDocs, getFirestore } from 'firebase/firestore';

import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  "TypeError: genAI.listModels is not a function",
]);

// Add DeviceTotalEnergyChart component
type DeviceData = {
  id: string;
  name: string;
  totalEnergy: number;
  deviceType: string;
};

const DeviceTotalEnergyChart: React.FC = () => {
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Added to trigger refreshes
  const { width } = useWindowDimensions();
  const chart_style = width > 768 ? styles.desktop_chart_style : styles.mobile_chart_style; 
  
  // Function to fetch device energy data
  const fetchDeviceEnergy = async () => {
    console.log("Fetching device energy data...");
    setIsLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.log("No user logged in");
        setIsLoading(false);
        return;
      }
      
      const firestore = getFirestore();
      const deviceCollectionRef = collection(firestore, "devices");
      const querySnapshot = await getDocs(deviceCollectionRef);
      
      const devices: DeviceData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter to include only devices belonging to the current user
        if (data.userId === user.uid) {
          console.log(`Device ${doc.id} energy: ${data.totalEnergy || 0}`);
          devices.push({
            id: doc.id,
            name: data.name || `Device ${doc.id}`,
            totalEnergy: data.totalEnergy || 0,
            deviceType: data.deviceType || 'Unknown'
          });
        }
      });
      
      if (devices.length === 0) {
        console.log("No devices found for user");
      }
      
      // Sort devices by energy consumption (highest first)
      devices.sort((a, b) => b.totalEnergy - a.totalEnergy);
      setDeviceData(devices);
    } catch (error) {
      console.error("Error fetching device energy data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data initially and on user change
  useEffect(() => {
    const auth = getAuth();
    
    // Listen for auth state changes and fetch data when user is available
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchDeviceEnergy();
      } else {
        setDeviceData([]);
        setIsLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Refresh data periodically and when refreshTrigger changes
  useEffect(() => {
    fetchDeviceEnergy();
    
    // Set up interval to refresh data every minute (60000ms)
    const interval = setInterval(() => {
      console.log("Auto-refreshing device energy data");
      fetchDeviceEnergy();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [refreshTrigger]);
  
  // Function to manually refresh data
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    setRefreshTrigger(prev => prev + 1);
  };
  
  if (isLoading && deviceData.length === 0) {
    return (
      <View style={[chart_style, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.cardTitle}>Total Energy By Device</Text>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }
  
  if (deviceData.length === 0) {
    return (
      <View style={[chart_style, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.cardTitle}>Total Energy By Device</Text>
        <Text style={{ color: '#FFF', marginTop: 20 }}>No device energy data available</Text>
        <TouchableOpacity 
          style={{ marginTop: 15, padding: 10, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 5 }}
          onPress={handleRefresh}
        >
          <Text style={{ color: '#FFF' }}>Refresh Data</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Prepare data for the chart
  const chartData = {
    labels: deviceData.map(device => device.deviceType.length > 12 ? device.deviceType.substring(0, 12) + '...' : device.deviceType),
    datasets: [{
      data: deviceData.map(device => Math.round(device.totalEnergy * 10) / 10)
    }]
  };
  
  // Use different colors based on device type
  const getColorByDeviceType = (deviceType: string, opacity = 1) => {
    const colors: {[key: string]: string} = {
      'Smart Light': `rgba(255, 239, 0, ${opacity})`,
      'Thermostat': `rgba(255, 87, 51, ${opacity})`,
      'TV': `rgba(30, 144, 255, ${opacity})`,
      'CCTV': `rgba(50, 205, 50, ${opacity})`,
      'Roomba': `rgba(255, 105, 180, ${opacity})`,
      'Washing Machine': `rgba(123, 104, 238, ${opacity})`,
      'Heart Rate Monitor': `rgba(255, 0, 0, ${opacity})`
    };
    return colors[deviceType] || `rgba(128, 128, 128, ${opacity})`;
  };
  
  return (
    <View style={chart_style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={styles.cardTitle}>Total Energy By Device</Text>
        <TouchableOpacity 
          style={{ padding: 5 }}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={isLoading ? "#555" : "#FFF"}
          />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={{ height: 240, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      ) : (
        <>
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={240}
            yAxisLabel=""
            yAxisSuffix=" kWh"
            withInnerLines={true}
            showValuesOnTopOfBars={true}
            chartConfig={{
              backgroundColor: '#001322',
              backgroundGradientFrom: '#001322',
              backgroundGradientTo: '#001322',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              // Custom colors for each bar based on device type
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726"
              }
            }}
            style={styles.chart}
          />
          <View style={styles.legend}>
            {deviceData.map((device, index) => (
              <View key={device.id} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: getColorByDeviceType(device.deviceType) }]} />
                <Text style={styles.legendText}>
                  {device.deviceType}: {device.totalEnergy.toFixed(1)} kWh
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// Keep NavBar component unchanged
const NavBar = () => {
  const isDesktop = Platform.OS === 'web';

  return (
    <View style={[styles.navBar, isDesktop ? styles.desktopEnergyNav : styles.mobileNav]}>
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
            size={35} 
            color="white" 
            
          />
        </TouchableOpacity>
      </Link>

      <Link href="/energy" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="lightning-bolt" 
            size={45} 
            color="white"
            style={styles.glowIcon}
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

// Add type definitions
type ChartData = {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    legend?: string;
  }[];
};

const { width: screenWidth } = Dimensions.get('window');

// Create a wrapper component for the BarChart to handle types properly
const BarChart = (props: any) => {
  return <RNBarChart {...props} />;
};

type TimeSelectorProps = {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
};

const TimeSelector: React.FC<TimeSelectorProps> = ({ selectedTime, onTimeSelect }) => {
  const getCurrentTimeRange = (type: string) => {
    const now = new Date();
    switch (type) {
      case 'day':
        return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'year':
        return now.getFullYear().toString();
      default:
        return '';
    }
  };

  return (
    <View style={styles.timeSelector}>
      {['day', 'week', 'month', 'year'].map((time) => (
        <TouchableOpacity
          key={time}
          style={[styles.timeButton, selectedTime === time && styles.selectedTimeButton]}
          onPress={() => onTimeSelect(time)}
        >
          <Text style={[styles.timeButtonText, selectedTime === time && styles.selectedTimeButtonText]}>
            {selectedTime === time ? getCurrentTimeRange(time) : time.charAt(0).toUpperCase() + time.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Replacing the GestureHandler-based RoomSlider with a standard ScrollView implementation
type RoomSliderProps = {
  selectedTime: string;
};

const RoomSlider: React.FC<RoomSliderProps> = ({ selectedTime }) => {
  const rooms = ['Living Room', 'Kitchen', 'Bedroom', 'Kids Room'];
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const roomsScrollRef = useRef<ScrollView>(null);
  
  const itemWidth = screenWidth - 40;

  const getChartData = (room: string) => {
    const data = {
      day: {
        labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
        data: [2.5, 3.8, 4.2, 3.9, 4.5, 3.2],
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [15.2, 14.8, 16.3, 15.9, 17.2, 13.8, 12.5],
      },
      month: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        data: [65.3, 58.9, 62.4, 59.8],
      },
      year: {
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
        data: [280, 310, 290, 350, 320, 285],
      },
    };
    return data[selectedTime as keyof typeof data];
  };

  // Function to scroll to a specific room
  const scrollToRoom = (index: number) => {
    if (roomsScrollRef.current) {
      roomsScrollRef.current.scrollTo({
        x: index * itemWidth,
        animated: true
      });
    }
    setActiveRoomIndex(index);
  };

  // Handle scroll events to update active room indicator
  const handleRoomScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / itemWidth);
    if (index !== activeRoomIndex && index >= 0 && index < rooms.length) {
      setActiveRoomIndex(index);
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

  return (
    <View style={localStyles.sliderContainer}>
      <View style={localStyles.roomsHeader}>
        <View style={localStyles.roomNav}>
          <TouchableOpacity 
            style={localStyles.navButton}
            onPress={() => scrollToRoom(Math.max(0, activeRoomIndex - 1))}
            disabled={activeRoomIndex === 0}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={activeRoomIndex === 0 ? "#555" : "#FFFFFF"}
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
              color={activeRoomIndex === rooms.length - 1 ? "#555" : "#FFFFFF"}
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
        snapToInterval={itemWidth}
        decelerationRate="fast"
        snapToAlignment="center"
        contentContainerStyle={localStyles.roomsScrollContainer}
      >
        {rooms.map((room, index) => {
          const chartData = getChartData(room);
          return (
            <View key={index} style={[styles.roomCard, { width: itemWidth }]}>
              <Text style={styles.roomTitle}>{room}</Text>
              <BarChart
                data={{
                  labels: chartData.labels,
                  datasets: [{ data: chartData.data }],
                }}
                width={itemWidth - 20}
                height={220}
                yAxisLabel=""
                yAxisSuffix=" kW"
                withInnerLines={true}
                showValuesOnTopOfBars={true}
                chartConfig={{
                  backgroundColor: '#001322',
                  backgroundGradientFrom: '#001322',
                  backgroundGradientTo: '#001322',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(245, 245, 245, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                style={styles.chart}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Keep SolarGeneration and DeviceUsage components unchanged
type SolarGenerationProps = {
  selectedTime: string;
};

const SolarGeneration: React.FC<SolarGenerationProps> = ({ selectedTime }) => {
  const getChartData = () => {
    const data = {
      day: {
        labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
        data: [0.2, 2.8, 4.5, 4.2, 2.1, 0.1],
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [12.5, 13.8, 11.2, 14.5, 12.8, 13.2, 12.9],
      },
      month: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        data: [45.3, 48.9, 52.4, 49.8],
      },
      year: {
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
        data: [180, 210, 290, 350, 320, 185],
      },
    };
    return data[selectedTime as keyof typeof data];
  };

  const chartData = getChartData();

  const { width } = useWindowDimensions(); // Get screen width

  const chart_style = width > 768 ? styles.desktop_chart_style : styles.mobile_chart_style; 


  return (
    <View style={chart_style}>
      <Text style={styles.cardTitle}>Solar Energy Generation</Text>
      <BarChart
        data={{
          labels: chartData.labels,
          datasets: [{ data: chartData.data }],
        }}
        width={screenWidth - 40}
        height={240}
        yAxisLabel=""
        yAxisSuffix=" kW"
        withInnerLines={true}
        showValuesOnTopOfBars={true}
        chartConfig={{
          backgroundColor: '#001322',
          backgroundGradientFrom: '#001322',
          backgroundGradientTo: '#001322',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    </View>
  );
};

type DeviceUsageProps = {
  selectedTime: string;
};

const DeviceUsage: React.FC<DeviceUsageProps> = ({ selectedTime }) => {
  const getChartData = () => {
    const devices = ['TV', 'CCTV', 'Roomba', 'Washing Machine', 'Lights', 'Thermostat'];
    const colors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
    ];

    const timeRanges = {
      day: {
        labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
        baseValues: [0.5, 0.8, 1.2, 0.9, 1.5, 0.7],
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        baseValues: [3.2, 3.8, 4.1, 3.9, 4.2, 3.5, 3.0],
      },
      month: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        baseValues: [15.5, 16.2, 14.8, 15.9],
      },
      year: {
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
        baseValues: [180, 210, 290, 350, 320, 185],
      },
    };

    const selectedRange = timeRanges[selectedTime as keyof typeof timeRanges];
    
    return {
      labels: selectedRange.labels,
      legend: devices,
      data: selectedRange.baseValues.map(baseValue =>
        devices.map((_, index) => baseValue * (index + 0.5))
      ),
      barColors: colors,
    };
  };

  const chartData = getChartData();
  const { width } = useWindowDimensions();
  const screenWidth = width;

  const chart_style = width > 768 
    ? styles.desktop_chart_style 
    : [styles.mobile_chart_style, { marginBottom: 175 }];

  return (
    <View style={chart_style}>
      <Text style={styles.cardTitle}>Individual Device Usage - Yesterday</Text>
      <StackedBarChart
        data={chartData}
        width={screenWidth - 40}
        height={240}
        chartConfig={{
          backgroundColor: '#001322',
          backgroundGradientFrom: '#001322',
          backgroundGradientTo: '#001322',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(245, 245, 245, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
        hideLegend={true}
      />
      <View style={styles.legend}>
        {chartData.legend.map((label, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: chartData.barColors[index] }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Main Energy component
const Energy = () => {
  const [selectedTime, setSelectedTime] = useState('day');
  const [deviceEnergyData, setDeviceEnergyData] = useState<DeviceData[]>([]); // Add state for device energy data

  // Fetch device energy data for PDF report
  useEffect(() => {
    const fetchDeviceEnergyForReport = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) return;
        
        const firestore = getFirestore();
        const deviceCollectionRef = collection(firestore, "devices");
        const querySnapshot = await getDocs(deviceCollectionRef);
        
        const devices: DeviceData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === user.uid) {
            devices.push({
              id: doc.id,
              name: data.name || `Device ${doc.id}`,
              totalEnergy: data.totalEnergy || 0,
              deviceType: data.deviceType || 'Unknown'
            });
          }
        });
        
        // Sort by energy consumption (highest first)
        devices.sort((a, b) => b.totalEnergy - a.totalEnergy);
        setDeviceEnergyData(devices);
      } catch (error) {
        console.error("Error fetching device energy data for report:", error);
      }
    };
    
    fetchDeviceEnergyForReport();
  }, []);

  const { width } = useWindowDimensions();
  const containerStyle = width > 768 ? styles.desktop_energy_container : styles.mobile_energy_container; 
  const chart_style = width > 768 ? styles.desktop_chart_style : styles.mobile_chart_style; 

  const generatePDF = async () => {
    try {
      // Create HTML content for device energy data
      const deviceEnergyHtml = `
        <div class="chart">
          <div class="chart-title">Device Energy Consumption</div>
          <div class="chart-data">
            ${deviceEnergyData.map(device => 
              `<div>${device.deviceType}: ${device.totalEnergy.toFixed(1)} kWh</div>`
            ).join('')}
          </div>
        </div>
      `;

      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              h1 {
                text-align: center;
                color: #001322;
              }
              .chart {
                margin-bottom: 20px;
              }
               .chart-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .chart-data {
                font-size: 14px;
                color: #555;
              }
            </style>
          </head>
           <body>
            <h1>Energy Report</h1>
            <div class="chart">
              <div class="chart-title">Electricity Consumption</div>
              <div class="chart-data">
                Time Range: ${selectedTime.charAt(0).toUpperCase() + selectedTime.slice(1)}
              </div>
              <div class="chart-data">
                Data: ${JSON.stringify(getChartDataForPDF('Electricity Consumption', selectedTime))}
              </div>
            </div>
            <div class="chart">
              <div class="chart-title">Solar Energy Generation</div>
              <div class="chart-data">
                Data: ${JSON.stringify(getChartDataForPDF('Solar Energy Generation', selectedTime))}
              </div>
            </div>
            <div class="chart">
              <div class="chart-title">Individual Device Usage</div>
              <div class="chart-data">
                Data: ${JSON.stringify(getChartDataForPDF('Individual Device Usage', selectedTime))}
              </div>
            </div>
            ${deviceEnergyData.length > 0 ? deviceEnergyHtml : ''}
          </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: 'Energy_Report',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF generated at:', file.filePath);
      alert('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF.');
    }
  };

  const getChartDataForPDF = (chartType: string, timeRange: string) => {
    switch (chartType) {
      case 'Electricity Consumption':
        return {
          labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
          data: [2.5, 3.8, 4.2, 3.9, 4.5, 3.2],
        };
      case 'Solar Energy Generation':
        return {
          labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
          data: [0.2, 2.8, 4.5, 4.2, 2.1, 0.1],
        };
      case 'Individual Device Usage':
        return {
          labels: ['TV', 'CCTV', 'Roomba', 'Washing Machine', 'Lights', 'Thermostat'],
          data: [1.2, 0.8, 1.5, 1.0, 2.3, 1.8],
        };
      default:
        return {};
    }
  };

  return (
    <View style={containerStyle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView style={styles.scrollView}>
          <TimeSelector selectedTime={selectedTime} onTimeSelect={setSelectedTime} />
          <View style={chart_style}>
            <Text style={styles.cardTitle}>Electricity Consumption</Text>
            <RoomSlider selectedTime={selectedTime} />
          </View>
          <SolarGeneration selectedTime={selectedTime} />
          <DeviceUsage selectedTime={selectedTime} />
          <DeviceTotalEnergyChart />
        </ScrollView>
        <TouchableOpacity style={localStyles.pdfButton} onPress={generatePDF}>
          <Text style={localStyles.pdfButtonText}>Generate PDF Report</Text>
        </TouchableOpacity>
        <Chatbot/>
        <NavBar />
      </KeyboardAvoidingView>
    </View>   
  );
};

// Add local styles
const localStyles = StyleSheet.create({
  pdfButton: {
    backgroundColor: '#001322',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderContainer: {
    marginVertical: 10,
  },
  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    backgroundColor: '#555',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#f4efeb', // Match your app's accent color
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  roomsScrollContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
});

export default Energy;