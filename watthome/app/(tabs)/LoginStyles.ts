import { StyleSheet } from "react-native";

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
});