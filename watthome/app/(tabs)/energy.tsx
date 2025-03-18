import React, { useState, useRef } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, Dimensions, ScrollView, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { StackedBarChart } from 'react-native-chart-kit';
import { styles } from "./LoginStyles";

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
      <Text style={styles.cardTitle}>Individual Device Usage</Text>
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

// Main Energy component remains mostly unchanged
const Energy = () => {
  const [selectedTime, setSelectedTime] = useState('day');

  const { width } = useWindowDimensions();
  const containerStyle = width > 768 ? styles.desktop_energy_container : styles.mobile_energy_container; 
  const chart_style = width > 768 ? styles.desktop_chart_style : styles.mobile_chart_style; 

  return (
    <View style={containerStyle}>
      
      <ScrollView style={styles.scrollView}>
        <TimeSelector selectedTime={selectedTime} onTimeSelect={setSelectedTime} />
        <View style={chart_style}>
          <Text style={styles.cardTitle}>Electricity Consumption</Text>
          <RoomSlider selectedTime={selectedTime} />
        </View>
        <SolarGeneration selectedTime={selectedTime} />
        <DeviceUsage selectedTime={selectedTime} />
      </ScrollView>
      <NavBar />
    </View>   
  );
};

// Add local styles
const localStyles = StyleSheet.create({
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