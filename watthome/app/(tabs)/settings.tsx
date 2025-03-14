import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, Switch, ScrollView, Image, Dimensions, TextInput, Modal } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from "./LoginStyles";
import { Instagram, Twitter, Camera, Mail } from 'lucide-react-native';
import ChangePasswordModal from './ChangePasswordModal';
import { auth } from "../../backend/firebaseConfig"; // Ensure this import is present

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I connect a new smart device?",
    answer: "To connect a new device, go to the Devices tab and tap the '+' button. Follow the on-screen instructions to pair your device. Make sure your device is in pairing mode and your phone's Bluetooth is enabled."
  },
  {
    question: "Can I create automated routines?",
    answer: "Yes! In the Automation tab, you can create custom routines based on time, device status, or location. For example, you can set lights to turn on at sunset or adjust the thermostat when you leave home."
  },
  {
    question: "Random question?",
    answer: "Go to Device Settings > Share Access and enter the email address of the family member you want to share with. They'll receive an invitation to join your home and can control shared devices."
  },
  {
    question: "What should I do if a device goes offline?",
    answer: "First, check if the device is powered on and within range of your WiFi network. Try power cycling the device by unplugging it for 30 seconds. If issues persist, ensure your home's WiFi is working properly."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption for all data transmission and storage. Your personal information and device data are protected with multiple layers of security, including two-factor authentication."
  }
];

const NavBar = () => {
  const isDesktop = Platform.OS === 'web';

  return (
    <View style={[styles.navBar, isDesktop ? styles.desktopNav : styles.mobileSettingsNav]}>
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
            size={42} 
            color="white"
            style={styles.glowIcon}
          />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const Settings = () => {
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));
  const isDesktop = Platform.OS === 'web' && windowDimensions.width > 768;
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [energySaving, setEnergySaving] = useState(true);
  const [voiceControl, setVoiceControl] = useState(true);
  const [autoUpdates, setAutoUpdates] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [username, setUsername] = useState('jess@1420');
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const openPasswordModal = () => {
    setPasswordModalVisible(true);
  };

  const closePasswordModal = () => {
    setPasswordModalVisible(false);
  };

  const handlePasswordChangeSuccess = () => {
    closePasswordModal();
    // Reset any necessary state here if needed
  };

  // Update dimensions on window resize (web only)
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => {
        setWindowDimensions(Dimensions.get('window'));
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <View style={styles.tabContent}>
            <View style={styles.profileContainer}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <Image 
                    source={{ uri: 'https://randomuser.me/api/portraits/women/49.jpg' }} 
                    style={styles.avatar} 
                  />
                  <TouchableOpacity style={styles.changeAvatarButton}>
                    <MaterialCommunityIcons name="camera" size={20} color="white" />
                  </TouchableOpacity>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>Jessica Novern</Text>
                  <Text style={styles.profileUsername}>{auth.currentUser ? auth.currentUser.email : 'Not logged in'}</Text>
                  <Text style={styles.profileBio}>Its jess here</Text>
                  <TouchableOpacity style={styles.editProfileButton}>
                    <Text style={styles.editProfileText}>Edit profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Name</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputValue}>Jessica Novern</Text>
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputValue}>{auth.currentUser ? auth.currentUser.email : 'Not logged in'}</Text>
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Location</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputValue}>Dubai, UAE</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      
        case 'account':
        return (
          <View style={styles.tabContent}>
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <Text style={styles.input}>**********</Text>
            </View>
    
            <View style={styles.formGroup}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={openPasswordModal}
              >
                <Text style={styles.actionButtonText}>Change password</Text>
              </TouchableOpacity>
            </View>
    
            <View style={styles.formGroup}>
              <Text style={styles.label}>Two-factor authentication</Text>
              <View style={styles.switchContainer}>
                <Switch 
                  value={true} 
                  trackColor={{ false: "#767577", true: "#001322" }}
                  thumbColor={"#f4f3f4"}
                />
                <Text style={styles.switchLabel}>Enabled</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Recovery Email</Text>
              <Text style={styles.input}>{auth.currentUser ? auth.currentUser.email : 'Not logged in'}</Text>
            </View>
    
            <View style={styles.formGroup}>
              <Text style={styles.label}>Account deletion</Text>
              <TouchableOpacity style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Delete account</Text>
              </TouchableOpacity>
            </View>
    
            <View style={styles.socialLinks}>
              
              <View style={styles.socialIconsContainer}>
                <TouchableOpacity style={styles.socialIcon}>
                  <Instagram size={24} color="#E4405F" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <Twitter size={24} color="#1DA1F2" />
                </TouchableOpacity>
                
              </View>
            </View>
          </View>
    
          <ChangePasswordModal
            visible={isPasswordModalVisible}
            onClose={closePasswordModal}
            onSuccess={handlePasswordChangeSuccess}
          />
        </View>
      );
      

      case 'preferences':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>App Preferences</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Notifications</Text>
                <View style={styles.switchContainer}>
                  <Switch 
                    value={notifications} 
                    onValueChange={setNotifications}
                    trackColor={{ false: "#767577", true: "#001322" }}
                    thumbColor={"#f4f3f4"}
                  />
                  <Text style={styles.switchLabel}>{notifications ? "Enabled" : "Disabled"}</Text>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Location Services</Text>
                <View style={styles.switchContainer}>
                  <Switch 
                    value={locationServices} 
                    onValueChange={setLocationServices}
                    trackColor={{ false: "#767577", true: "#001322" }}
                    thumbColor={"#f4f3f4"}
                  />
                  <Text style={styles.switchLabel}>{locationServices ? "Enabled" : "Disabled"}</Text>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Energy Saving Mode</Text>
                <View style={styles.switchContainer}>
                  <Switch 
                    value={energySaving} 
                    onValueChange={setEnergySaving}
                    trackColor={{ false: "#767577", true: "#001322" }}
                    thumbColor={"#f4f3f4"}
                  />
                  <Text style={styles.switchLabel}>{energySaving ? "Enabled" : "Disabled"}</Text>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Automatic Updates</Text>
                <View style={styles.switchContainer}>
                  <Switch 
                    value={autoUpdates} 
                    onValueChange={setAutoUpdates}
                    trackColor={{ false: "#767577", true: "#001322" }}
                    thumbColor={"#f4f3f4"}
                  />
                  <Text style={styles.switchLabel}>{autoUpdates ? "Enabled" : "Disabled"}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Accesibility</Text>
              <View style={styles.formGroup}> 
                <Text style={styles.label}>Dark Mode</Text>
                <View style={styles.switchContainer}>
                  <Switch 
                    value={darkMode} 
                    onValueChange={setDarkMode}
                    trackColor={{ false: "#767577", true: "#001322" }}
                    thumbColor={"#f4f3f4"}
                  />
                  <Text style={styles.switchLabel}>{darkMode ? "Enabled" : "Disabled"}</Text>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Voice Commands</Text>
                <View style={styles.switchContainer}>
                  <Switch 
                    value={voiceControl} 
                    onValueChange={setVoiceControl}
                    trackColor={{ false: "#767577", true: "#001322" }}
                    thumbColor={"#f4f3f4"}
                  />
                  <Text style={styles.switchLabel}>{voiceControl ? "Enabled" : "Disabled"}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      
        case 'security':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Security Settings</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Recent Login History</Text>
                <View style={styles.securityItem}>
                  <View style={styles.securityInfo}>
                    <MaterialCommunityIcons name="shield-check" size={24} color="#001322" />
                    <View style={styles.securityDetails}>
                      <Text style={styles.securityTitle}>Media City, Dubai, UAE</Text>
                      <Text style={styles.securityMeta}>Today at 10:30 AM</Text>
                    </View>
                  </View>
                  <Text style={styles.securityStatus}>Current</Text>
                </View>
                <View style={styles.securityItem}>
                  <View style={styles.securityInfo}>
                    <MaterialCommunityIcons name="shield-check" size={24} color="#001322" />
                    <View style={styles.securityDetails}>
                      <Text style={styles.securityTitle}>Al Barsha, Dubai, UAE</Text>
                      <Text style={styles.securityMeta}>Yesterday at 8:15 PM</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Security Log</Text>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>View full log</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

        case 'Help':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Help & Support</Text>
              <View style={styles.faqContainer}>
                {faqs.map((faq, index) => (
                  <View key={index} style={styles.faqItem}>
                    <TouchableOpacity 
                      onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    >
                      <Text style={[styles.faqQuestion, styles.faqText]}>{faq.question}</Text>
                      {/* <MaterialCommunityIcons 
                        name={expandedFAQ === index ? "chevron-up" : "chevron-down"} 
                        size={24} 
                        color="#666" 
                        position="absolute"
                        right={0}
                        paddingLeft={10}
                        
                      /> */}
                    </TouchableOpacity>
                    {expandedFAQ === index && (
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    )}
                  </View>

                ))}
                <View style={styles.contactSection}>
                  <Text style={styles.contactTitle}>Need more help?</Text>
                  <View style={styles.contactCard}>
                    <Mail size={24} color="#001322" />
                    <Text style={styles.contactEmail}>support@watthome.com</Text>
                  </View>
                  <Text style={styles.contactNote}>We typically respond within 24 hours</Text>
                </View>
              </View>
            </View>
          </View>
        );


      default:
        return null;
    }
  };

  // Mobile sidebar component
  const MobileSidebar = () => (
    <View style={[
      styles.mobileSidebar,
      sidebarVisible ? styles.mobileSidebarVisible : styles.mobileSidebarHidden
    ]}>
      <View style={styles.mobileSidebarHeader}>
        <Text style={styles.mobileSidebarTitle}>Settings</Text>
        <TouchableOpacity onPress={toggleSidebar}>
          <MaterialCommunityIcons name="close" size={24} color="#24292e" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.sidebarItem, activeTab === 'profile' && styles.activeSidebarItem]}
        onPress={() => {
          setActiveTab('profile');
          setSidebarVisible(false);
        }}
      >
        <MaterialCommunityIcons 
          name="account" 
          size={20} 
          color={activeTab === 'profile' ? "#001322" : "#666"} 
        />
        <Text style={[styles.sidebarText, activeTab === 'profile' && styles.activeSidebarText]}>
          Profile
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.sidebarItem, activeTab === 'account' && styles.activeSidebarItem]}
        onPress={() => {
          setActiveTab('account');
          setSidebarVisible(false);
        }}
      >
        <MaterialCommunityIcons 
          name="shield-account" 
          size={20} 
          color={activeTab === 'account' ? "#001322" : "#666"} 
        />
        <Text style={[styles.sidebarText, activeTab === 'account' && styles.activeSidebarText]}>
          Account
        </Text>
      </TouchableOpacity>
      
     
      
      <TouchableOpacity 
        style={[styles.sidebarItem, activeTab === 'preferences' && styles.activeSidebarItem]}
        onPress={() => {
          setActiveTab('preferences');
          setSidebarVisible(false);
        }}
      >
        <MaterialCommunityIcons 
          name="dots-horizontal-circle" 
          size={20} 
          color={activeTab === 'preferences' ? "#001322" : "#666"} 
        />
        <Text style={[styles.sidebarText, activeTab === 'preferences' && styles.activeSidebarText]}>
          Preferences
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.sidebarItem, activeTab === 'security' && styles.activeSidebarItem]}
        onPress={() => {
          setActiveTab('security');
          setSidebarVisible(false);
        }}
      >
        <MaterialCommunityIcons 
          name="lock" 
          size={20} 
          color={activeTab === 'security' ? "#001322" : "#666"} 
        />
        <Text style={[styles.sidebarText, activeTab === 'security' && styles.activeSidebarText]}>
          Security
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.sidebarItem, activeTab === 'Help' && styles.activeSidebarItem]}
        onPress={() => {
          setActiveTab('Help');
          setSidebarVisible(false);
        }}
      >
        <MaterialCommunityIcons 
          name="help-circle" 
          size={20} 
          color={activeTab === 'Help' ? "#001322" : "#666"} 
        />
        <Text style={[styles.sidebarText, activeTab === 'Help' && styles.activeSidebarText]}>
          Help & Support
        </Text>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      <TouchableOpacity style={styles.logoutButton}>
        <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );

  // Mobile header with menu button
  const MobileHeader = () => (
    <View style={styles.mobileHeader}>
      <TouchableOpacity onPress={toggleSidebar}>
        <MaterialCommunityIcons name="menu" size={24} color="#24292e" />
      </TouchableOpacity>
      <Text style={styles.mobileHeaderTitle}>
        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
      </Text>
      <View style={{ width: 24 }} />
    </View>
  );

  // Desktop layout
  const DesktopLayout = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.sidebar}>
          <TouchableOpacity 
            style={[styles.sidebarItem, activeTab === 'profile' && styles.activeSidebarItem]}
            onPress={() => setActiveTab('profile')}
          >
            <MaterialCommunityIcons 
              name="account" 
              size={20} 
              color={activeTab === 'profile' ? "#001322" : "#666"} 
            />
            <Text style={[styles.sidebarText, activeTab === 'profile' && styles.activeSidebarText]}>
              Profile
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.sidebarItem, activeTab === 'account' && styles.activeSidebarItem]}
            onPress={() => setActiveTab('account')}
          >
            <MaterialCommunityIcons 
              name="shield-account" 
              size={20} 
              color={activeTab === 'account' ? "#001322" : "#666"} 
            />
            <Text style={[styles.sidebarText, activeTab === 'account' && styles.activeSidebarText]}>
              Account
            </Text>
          </TouchableOpacity>
          
          
          <TouchableOpacity 
            style={[styles.sidebarItem, activeTab === 'preferences' && styles.activeSidebarItem]}
            onPress={() => setActiveTab('preferences')}
          >
            <MaterialCommunityIcons 
              name="cog" 
              size={20} 
              color={activeTab === 'preferences' ? "#001322" : "#666"} 
            />
            <Text style={[styles.sidebarText, activeTab === 'preferences' && styles.activeSidebarText]}>
              Preferences
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.sidebarItem, activeTab === 'security' && styles.activeSidebarItem]}
            onPress={() => setActiveTab('security')}
          >
            <MaterialCommunityIcons 
              name="lock" 
              size={20} 
              color={activeTab === 'security' ? "#001322" : "#666"} 
            />
            <Text style={[styles.sidebarText, activeTab === 'security' && styles.activeSidebarText]}>
              Security
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.sidebarItem, activeTab === 'Help' && styles.activeSidebarItem]}
            onPress={() => setActiveTab('Help')}
          >
            <MaterialCommunityIcons 
              name="help-circle" 
              size={20} 
              color={activeTab === 'Help' ? "#001322" : "#666"} 
            />
            <Text style={[styles.sidebarText, activeTab === 'Help' && styles.activeSidebarText]}>
              Help & Support
            </Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.mainContent}>
          {renderTabContent()}
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Smart Home v1.0.0</Text>
      </View>
    </ScrollView>
  );

  // Mobile layout
  const MobileLayout = () => (
    <View style={styles.mobileContainerProfile}>
      <MobileHeader />
      <ScrollView style={styles.mobileContent}>
        {renderTabContent()}
      </ScrollView>
      <MobileSidebar />
      {sidebarVisible && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={() => setSidebarVisible(false)}
          activeOpacity={1}
        />
      )}
    </View>
  );

  return (
    <View style={[
      styles.dev_container, 
      isDesktop ? styles.desktopContainer : styles.mobileContainerProfile
    ]}>
      <NavBar />
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </View>
  );
};

export default Settings;