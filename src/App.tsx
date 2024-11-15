import { Component } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import "./default.scss";
import HomePage from "./pages/HomePage";
import Registration from "./pages/Registration";
import { auth, handleUserProfile } from "./firebase/utils";
import { onSnapshot } from "firebase/firestore";

// Layouts
import MainLayout from "./layouts/MainLayout";
import HomePageLayout from "./layouts/HomePageLayout";
import Login from "./pages/Login";
import { Unsubscribe } from "firebase/auth";

// User State Initialization
const initialState = {
  currentUser: null,
};

interface AppProps {
  onClick: () => void;
}

interface AppState {
  currentUser: object | null;
}

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = initialState;
  }

  authListener: Unsubscribe | null = null;

  componentDidMount(): void {
    this.authListener = auth.onAuthStateChanged(async (userAuth) => {   

          // TEST
      console.log("auth.onAuthStateChanged triggered with userAuth: ", userAuth);

      if (!userAuth) return;
      
      try{
        if (userAuth) {
          const userRef = await handleUserProfile(userAuth);

          // TEST
            console.log("userRef received from handleUserProfile: ", userRef);

          if (userRef) {
            onSnapshot(userRef, (snapshot) => {

              // TEST
                console.log("Does Snapshot exist?", snapshot.exists());
                
              if (snapshot.exists()) {

                 // TEST
              console.log("Yay! Snapshot exists: ", snapshot.data());

                this.setState({
                  currentUser: {
                    id: snapshot.id,
                    ...snapshot.data(),
                  },
                });
              } else {
                console.log("Snapshot does not exist.")
              }
            });
          } else {
            console.log("No user reference returned. :( ");
          };
        }
      } catch (error) {
        console.error("Error in onAuthStateChanged: ", error);
      }
    });
  }

  componentWillUnmount(): void {
    if (this.authListener) {
      this.authListener();
    }
  }

  render() {
    const { currentUser } = this.state;

    return (
      <>
        <div className="app">
          <Routes>
            <Route
              path="/"
              element={
                <HomePageLayout currentUser={currentUser}>
                  <HomePage />
                </HomePageLayout>
              }
            />
            <Route
              path="/registration"
              element={
                <MainLayout currentUser={currentUser}>
                  <Registration />
                </MainLayout>
              }
            />
            <Route
              path="/login"
              element={
                currentUser ? (
                  <Navigate to="/" />
                ) : (
                  <MainLayout currentUser={currentUser}>
                    <Login />
                  </MainLayout>
                )
              }
            />
          </Routes>
        </div>
      </>
    );
  }
}

export default App;
