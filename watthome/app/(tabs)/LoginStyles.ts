import { StyleSheet } from "react-native";
import { Platform } from "react-native";

export const styles = StyleSheet.create({
  //login signup stuff
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  card: {
    backgroundColor: "rgba(0, 19, 34, 0.89)",
    padding: 20,
    borderRadius: 10,
    paddingBottom: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  desktopCard: {
    width: "20%",
    minWidth: 400,
    maxWidth: 500,
  },
  mobileCard: {
    width: "80%",
    maxWidth: 400,
  },
  logo: {
    resizeMode: "contain",
    marginBottom: 15,
  },
  desktopLogo: {
    width: 350,
    height: 250,
  },
  mobileLogo: {
    width: 250,
    height: 200,
  },
  loginBtn: {
    backgroundColor: "#D49C6E",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  signupBtn: {
    backgroundColor: "#D49C6E",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    color: "#FFF",
    marginVertical: 10,
  },
  backArrowBtn: {
    alignSelf: "flex-start",
  },
  backArrowText: {
    fontSize: 24,
    color: "#FFF",
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
  errorMessage: {
    color: "#FF0000",
    marginBottom: 10,
  },


  //navbar stuff
  nav_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  //settings page after updated nav stuff till desktopContainer 
  // navBar: {
  //   position: Platform.OS === 'web' ? 'fixed' : 'absolute',
  //   backgroundColor: "#001322",
  //   padding: 10,
  //   alignItems: 'center',
  //   borderRadius: 10,
  //   zIndex: 1000,
  // },
  // desktopNav: {
  //   left: 0,
  //   top: 0,
  //   bottom: 0,
  //   width: 60,
  //   paddingBottom: 60,
  //   alignItems: 'center',
  //   justifyContent: 'space-around',
  // },
  // mobileNav: {
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   height: 80,
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   alignItems: 'center',
  //   paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  //   paddingTop: 10,
  //   paddingLeft: 10,
  // },
  // dev_container: {
  //   flex: 1,
  //   backgroundColor: '#f5f5f5',
  // },
  // desktopContainer: {
  //   flex: 1,
  //   paddingLeft: 70, // Space for the sidebar nav
  // },

  //intitial one 
  navBar: {
    position: 'fixed',
    backgroundColor: "#001322",
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    zIndex: 1000,
  },
  desktopNav: {
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    //marginLeft: 1000,
  },
  
  mobileNav: {
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    position: 'fixed',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, 
    paddingTop: 10,
    paddingLeft: 10,
  },

  mobileSettingsNav: {
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    position: 'fixed',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, 
    paddingTop: 10,
    paddingLeft: 10,
  },

  dev_container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // New styles for desktop and mobile containers
  desktopContainer: {
    paddingLeft: 70, // Space for the sidebar nav
    padding : 2000,
    marginLeft: 60,
    paddingRight: 60,
  },

  icon: {
    margin: 10,
  },

  glowIcon: {
    shadowColor: "rgba(255, 255, 255, 0.8)",  // White glow color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 10,
    shadowRadius: 1,  // Increase for a stronger glow
    elevation: 1000,     // For Android shadow support
  },


  
  mobileContainer: {
    paddingBottom: -20, // Space for the bottom nav
  },
  

  //devices page stuff
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  
  tabContainer: {
    flexDirection: 'row',
  },
  
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#98999e',
    borderRadius: 20,
    marginRight: 10,
  },
  
  activeTab: {
    backgroundColor: '#001322',
  },
  
  tabText: {
    color: '#fffcf2',
    fontWeight: 'bold',
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
  
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    //paddingBottom: 20,
  },
  
  deviceCard: {
    width: 160,
    backgroundColor: '#001322',
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
  },
  
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    color: 'white',
  },
  
  deviceLocation: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
  
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  tempControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  
  tempText: {
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: 'white',
  },

  brightnessControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },

  brightnessText: {
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: 'white',
  },

  roombaControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    color: 'white',
  },

  roombaSpeed: {
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: 'white',
  },

  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },

  volumeText: {
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: 'white',
  },

  controlPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },

  controlText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: 'white',
  },
  
  washingStatus: {
    fontSize: 16,
    marginHorizontal: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  
  resetButton: {
    marginLeft: 5,
    padding: 3,
  },
  
  addDeviceCard: {
    width: 160,
    height: 160,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    borderWidth: 2,
    borderColor: '#001322',
    borderStyle: 'dashed',
  },
  
  addDeviceText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001322',
  },
  
  addDeviceFormContainer: {
    position: Platform.OS === 'web' ? 'fixed': 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  
  addDeviceForm: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#001322',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  
  addDeviceFormTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
  },
  
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#ffffff',
  },
  
  formInput: {
    width: '100%',
    color: 'white',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  
  pickerContainer: {
    marginBottom: 15,
  },
  
  deviceTypeOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#001322',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  
  selectedDeviceType: {
    backgroundColor: '#f5f5f5',
  },
  
  deviceTypeText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  
  selectedDeviceTypeText: {
    color: '#001322',
  },
  
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  
  cancelButtonText: {
    color: '#001322',
    fontWeight: 'bold',
  },
  
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#001322',
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  groupsContainer: {
    flex: 1,
    padding: 5,
  },
  
  groupContainer: {
    marginBottom: 16,
    backgroundColor: '#98a9b5',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'space-around',
    
    
  },
  
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#001d33',
  },
  
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fffcf2',
    marginLeft: 8,
  },
  
  groupDevices: {
  padding: 16,
  backgroundColor: '#d0d5d9',
  flexDirection: 'row',
  flexWrap: 'wrap',
  //justifyContent: 'space-between', good for desktop bad for mobile (left aligned)
  justifyContent: 'center',
  alignContent: 'center',
  alignItems: 'center',
  gap: 16,
},
  
  removeGroupButton: {
    padding: 4,
  },
  
  addGroupButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  
  addGroupText: {
    color: '#001322',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  
  addGroupFormContainer: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 2000,
  },
  
  addGroupForm: {
    backgroundColor: '#001322',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    maxWidth: 500,
  },
  
  addGroupFormTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ffffff',
  },
  
  deviceSelector: {
    maxHeight: 200,
    marginBottom: 16,
  },
  
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#001322',
    borderWidth:2,
    borderColor: '#ffffff',

  },
  
  selectedDevice: {
    backgroundColor: '#ffffff',
    borderWidth:2,
    borderColor: '#ffffff',
  },
  
  deviceOptionText: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 16,
  },
  
  selectedDeviceText: {
    color: '#001322',
  },



  //settings page stuff
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#24292e',
  },
  content: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    width: 250,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e1e4e8',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 4,
  },
  activeSidebarItem: {
    backgroundColor: '#f1f8ff',
  },
  sidebarText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  activeSidebarText: {
    color: '#001322',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e4e8',
    marginVertical: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FF3B30',
  },
  mainContent: {
    flex: 1,
    padding: 24,
  },
  tabContent: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    overflow: 'hidden',
  },
  profileContainer: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  changeAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#001322',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
    color: '#24292e',
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    color: '#24292e',
    fontWeight: '500',
  },
  infoSection: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#24292e',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#f6f8fa',
  },
  inputValue: {
    fontSize: 16,
    color: '#24292e',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#24292e',
  },
  actionButton: {
    backgroundColor: '#001322',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#ffdce0',
    borderWidth: 1,
    borderColor: '#cb2431',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  dangerButtonText: {
    color: '#cb2431',
    fontWeight: '500',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceDetails: {
    marginLeft: 12,
  },
  loginDeviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#24292e',
  },
  deviceMeta: {
    fontSize: 14,
    color: '#666',
  },
  remove_Button: {
    backgroundColor: '#ffdce0',
    borderWidth: 1,
    borderColor: '#cb2431',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeButtonText: {
    color: '#cb2431',
    fontWeight: '500',
    fontSize: 12,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityDetails: {
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#24292e',
  },
  securityMeta: {
    fontSize: 14,
    color: '#666',
  },
  securityStatus: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Mobile specific styles
  mobileContainerProfile: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    //paddingBottom: 9,
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#24292e',
  },
  mobileContent: {
    flex: 1,
    paddingBottom: 20, // Space for the navbar
  },
  mobileSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#ffffff',
    padding: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  mobileSidebarVisible: {
    transform: [{ translateX: 0 }],
  },
  mobileSidebarHidden: {
    transform: [{ translateX: -300 }],
  },
  mobileSidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  mobileSidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#24292e',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },

  mobileWrapper: {
    flex: 1,
    position: 'relative',
  },

  //Settings Page Account tab
  socialLinks: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  socialIcon: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#001322',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
  },
  modalButtonPrimary: {
    backgroundColor: '#001322',
  },
  modalButtonText: {
    color: '#4a4a4a',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonTextPrimary: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },

  faqContainer: {
    padding: 20,
  },
  faqItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#001322',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 8,
  },
  faqText: {
    fontSize: 18, 
    color: '#4a4a4a',
  },
  faqButton: {
    padding: 12,
    backgroundColor: '#001322',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  faqButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },

  contactSection: { 
    padding: 20,
  },
  contactTitle: { 
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#001322',
  },
  contactCard: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: '#001322',
    textAlign: 'center',
  },
  contactNote: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 8,
  },

  //energy page stuff

  desktop_energy_container: {
    flex: 1,
    //backgroundColor: '#f5f5f5',
    backgroundColor: '#f5f5f5',
    //padding: 30,
    paddingLeft: 55,
    paddingRight: -5,
    //alignItems: 'center',
    //flexWrap: 'wrap',
    paddingTop: -200,
    marginLeft: 55,
  },

  mobile_energy_container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    //paddingRight: 8,
    // paddingTop: -50,
    //marginBottom: 10,

  },

  mobileEnergyNav: {
    left: 0,
    right: 0,
    //bottom: -683,
    //bottom: -600,
    bottom: 0,
    height: 80,
    position: 'fixed',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, 
    paddingTop: 10,
    paddingLeft: 10,
  },

  desktopEnergyNav: {
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    //paddingRight: 10,
    //marginRight: 100,
  },

  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    //paddingTop: 50,
    //backgroundColor: '#1e1e1e',
    marginBottom: 5,
    marginTop: 1,
    borderRadius: 20,
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#98999e',
  },
  selectedTimeButton: {
    backgroundColor: '#001322',
  },
  timeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedTimeButtonText: {
    fontWeight: 'bold',
  },

  mobile_chart_style: {
    backgroundColor: '#001322',
    borderRadius: 15,
    padding: 15,
    paddingLeft: 1,
    margin: 10,
    //marginRight: -0.9,
    marginRight: 10,
    //marginLeft: -10,
  },

  desktop_chart_style: {
    backgroundColor: '#001322',
    borderRadius: 15,
    padding: 15,
    //paddingLeft: 1,
    margin: 10,
    marginRight: -0.9,
    //marginRight: 10,
    //marginLeft: -10,
  },
  
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingLeft: 13,
    paddingBottom: 25,
  },
  sliderContainer: {
    position: 'relative',
    color: '#fff',
  },
  sliderWrapper: {
    overflow: 'hidden',
    borderRadius: 15,
  },
  slider: {
    flexDirection: 'row',
  },
  roomCard: {
    backgroundColor: '#001322',
    borderRadius: 15,
    padding: 3,

  },
  roomTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roomIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    paddingTop: -25,
  },
  roomIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9c9c9c',
    marginHorizontal: 4,
  },
  activeRoomIndicator: {
    backgroundColor: '#81a4f7',
    transform: [{ scale: 1.2 }],
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    color: '#fff',

  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    color: '#fff',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
    color: '#fff',
    //marginBottom: 170,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
    //marginBottom: 170,
  },


  //Home page stuff
  Home_title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
    paddingLeft: 5,
    textAlign: 'left',
    marginBottom: 15,

  },
  subtitle: {
    fontSize: 31,
    fontWeight: 'bold',
    color: '#000000',
    opacity: 0.8,
    marginTop: 10,
    marginBottom: 15,
    //paddingLeft: 20,
  },
  usersSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  usersTitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 10,
    fontWeight: '600',
  },
  scrollContainer: {
    height: 100, // Fixed height
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 10,
  },
  scrollContentContainer: {
    paddingRight: 10,
  },
  profileImageContainer: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#2d2d2d',
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },

  keyboardAvoidingContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: 1000,
},
  
});
