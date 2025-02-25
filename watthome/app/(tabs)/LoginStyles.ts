import { StyleSheet } from "react-native";
import { Platform } from "react-native";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(0, 19, 34, 0.89)",
    padding: 20,
    borderRadius: 10,
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



  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  navBar: {
    position: 'absolute',
    backgroundColor: "#001322",
    width: "100%",
    padding: 10,
    alignItems: 'center',
  },
  desktopNav: {
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  mobileNav: {
    left: 0,
    right: 0,
    bottom: 90,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, 
    paddingTop: 10,
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
});