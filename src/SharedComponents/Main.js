import React, { Component } from "react";
import {Layout, Button, message} from "antd";
import POIInstruction from  './POIInstruction';
import LoginForm from "../BeforeLogin/LoginForm";
import RegisterForm from "../BeforeLogin/RegisterForm";
import Logout from "../AfterLogin/LogOut"
import { useState } from "react";
import '../styles/Main.css';
import KeywordSearch from './KeywordSearch';
import Map from './Map';
import { getUserInfo } from "../Utils/userUtils";
import { getAllRoutes, getRouteDetailsById } from "../Utils/routeUtils";



const { Header, Content, Footer} = Layout;

function Main(props) {
    const [authed, setAuthed] = useState(false);
    const [searchResults, setSearchResults] = useState();
    const [pickedPOI, setPickedPOI] = useState();
    const [user, setUser] =useState();
    const [route, setRoute] = useState();
    const [addedPOI, setAddedPOI] = useState(null);

    const setTripPOI = (poi) => {
        setAddedPOI(poi);
    }

    const onLoginSuccess = (username) => {        
        getUserInfo(username).then((data)=> {
            setUser(data);
        }).catch((err) => {
            message.error(err.message);
        }).finally(()=>{
            setAuthed(true);
        });   

        getRouteDetailsById(5).then((data)=>{
            setRoute(data);
        }).catch((err) => {
            message.error(err.message);
        }).finally(()=>{
            setAuthed(true);
        }); 
     }
    
    const onRegisterSuccess = () =>{}
    const onLogoutSuccess = ()=> {
        setAuthed(false);
    }

    return (
        <Layout style={{display: "flex", justifyContent: "space-between", height: "100vh" }}>

            <Header style={{paddingLeft: 0, paddingRight: 0}}>
                <div className="header">
                    <div className="title">
                    Travel Planner
                    </div>
                    <>
                        {authed ? ( <div className="welcome"> 
                                        <div>Welcome <strong> {`${user.firstName}`} </strong> ! </div> 
                                        <Logout onLogoutSuccess={onLogoutSuccess} /> 
                                    </div> ) : (
                        <div className="login-button">
                        <LoginForm onLoginSuccess={onLoginSuccess} />
                        <RegisterForm onSuccess={onRegisterSuccess} />
                        </div>
                        )}
                    </>
                </div>
        </Header>

        <Content> 
        
            <div className="site-drawer-render-in-current-wrapper">
                            {/* 这里填充components */}
                <KeywordSearch 
                loadSearchResult={(data)=>setSearchResults(data)} 
                loadSelectedPOI={ (item)=>setPickedPOI(item) }
                />

                <Map 
                    searchData = {searchResults} 
                    pickedPOI={pickedPOI} 
                    routePoints={route}
                    AddPOI={(poi) => setTripPOI(poi)}
                />
            
            </div>
        </ Content>

        <Footer className="footer">
                ©2021 Travel Planner. All Rights Reserved. Developed by FLAG Team 2
        </Footer>
    </Layout>
    );
  }
  
export default Main;