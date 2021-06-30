import React, { useState, useEffect} from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import * as POIData from "./POI-data-test.json";
import mapStyles from "../styles/mapStyles";
import PropTypes from 'prop-types'
import {searchByRange} from '../Utils/searchUtils';
import "../styles/Map.css"
import { Button, Image, Card, message } from "antd";


const libraries = ["places"];
const mapContainerStyle = {
    // overflow: "hidden !important" ,
    // lineHeight: 1.35,
    // whiteSpace: "nowrap",
    width: '100vw',
    height: '100%',
};

const options = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
};

const DirectionsPropTypes = {
    styles: PropTypes.shape({
        container: PropTypes.object.isRequired,
    }).isRequired,
}


function Map({initCenter, searchData, pickedPOI, routePoints}) {

    const mapRef = React.useRef();
    const[selectedPOI, setSelectedPOI] = useState(null);
    const[center, setCenter] = useState();
    const[showNearBy, setShowNearBy] = useState(true);

    const [POIData, setPOIData] = useState([]);
    const [loading, setLoading] = useState(false);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLEMAP_API,
        libraries,
    });

    const [response, setResponse] = useState(null)
    const [directionReq, setDirectionReq]=useState(null);


    function handleLoad(map) {
        mapRef.current = map;
    }
    
    function handleBoundsChanged() {
        if (!mapRef.current) return;
        //const newPos = mapRef.current.getCenter().toJSON();
       // setPosition(newPos);
      // setCenter(newPos);
        //console.log(newPos)
       // if(searchData.length !== 0) {
       //     setPOIData(searchData);
       // } else {     
          
      //  if (showNearBy)       
      //      getNearbyPOIs();
        //}
    }


    
    useEffect(()=>{
        if (!center){
            setCenter(initCenter);
        }

    })

    /* if picked POI is updated from search results or route drawer
    Centerize that POI and show details
    */
    useEffect(()=>{
        if (pickedPOI) {
            onSelectPOI(pickedPOI);
        }
    }, [pickedPOI])

    /* if route points is passed in, generate and show route */
    useEffect(()=>{
        if(routePoints) {
            onGenerateRoute(routePoints);
        }
    }, [routePoints])

    const onSelectPOI = (poi)=> {
        setSelectedPOI(poi);
        setCenter({lat: poi.lat, lng: poi.lng});
    }

    const onGenerateRoute=(routePoints)=> {

        const directReq = {
            origin: routePoints.startAddress,
            destination: routePoints.endAddress,
            travelMode: "DRIVING",
        }
        const waypoints = [];
        routePoints.poiList.forEach (poi => {
            waypoints.push({
                location: {lat: poi.lat, lng: poi.lng},
                stopover: true
            })
        })
        directReq.waypoints = waypoints;
        setDirectionReq(directReq);
    }

    useEffect( ()=> {
        if(searchData.length !== 0) {
            setPOIData(searchData);
            setShowNearBy(false);
        } else {         
            setShowNearBy(true);              
            getNearbyPOIs();
        }
        console.log("search data changed")
    },[searchData])

    const getNearbyPOIs = ()=> {
        if (!mapRef.current) return;
        
        const ne = mapRef.current.getBounds().getNorthEast().toJSON();
        const c = mapRef.current.getCenter().toJSON();

        const radius = haversine_distance(c,ne);

        searchByRange(c.lat, c.lng, radius)
            .then((data) => {
                setPOIData(data);
            })
            .catch((err) => {
                message.error(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function haversine_distance(p1, p2) {
        var R = 6371; // Radius of the Earth in kms
        var rlat1 = p1.lat * (Math.PI/180); // Convert degrees to radians
        var rlat2 = p2.lat * (Math.PI/180); // Convert degrees to radians
        var difflat = rlat2-rlat1; // Radian difference (latitudes)
        var difflon = (p2.lng-p1.lng) * (Math.PI/180); // Radian difference (longitudes)
  
        var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
        return d;
      }

    const directionsCallback = React.useCallback((res) => {
        console.log(res)

        if (res !== null) {
            if (res.status === 'OK') {
                setResponse(res)
            } else {
                console.log('response: ', res)
            }
        }
    }, [])

    const onMapClick = React.useCallback((...args) => {
        console.log('onClick args: ', args)
    }, [])

    let directionsRendererOptions = {
        directions: response,
    }

    const onAddPOItoRoute = (poi)=>{
        console.log("onAddPOItoRoute");
    }
    if (loadError) return "Error";
    if (!isLoaded) return "Loading...";

    return (
        <div style={{height: "inherit"}}>
            

            <GoogleMap
                
                mapContainerStyle={mapContainerStyle}
                onBoundsChanged={handleBoundsChanged}
                zoom={13}
                center={center}
                options={options}
                onLoad={handleLoad}
                onTilesLoaded={ ()=>{ if (showNearBy)
                 getNearbyPOIs()}}

            >
                
                {POIData.map(POI => (
                    <Marker
                        key = {POI.poiId}
                        position = {{
                            lat: POI.lat,
                            lng: POI.lng
                        }}
                        onClick={() => {
                            onSelectPOI(POI);
                        }}
                        icon = {{
                            url: POI.imageUrl,
                            scaledSize: new window.google.maps.Size(50, 50)
                        }}
                    />
                ))}

                {selectedPOI && (
                    <InfoWindow
                        position = {{
                            lat: selectedPOI.lat,
                            lng: selectedPOI.lng
                        }}
                        onCloseClick={() => {
                            setSelectedPOI(null);
                        }}
                    >
                        <div className="info-window">
                            <Image 
                                    src={selectedPOI.imageUrl}                                    
                                    alt={selectedPOI.name}
                                    className="info-image"
                             />
                             <div className="card-button">
                             <Card title ={selectedPOI.name} bodyStyle={{paddingTop: 0, paddingBottom: 0}}>
                                {selectedPOI.description}                                
                             </Card>
                             <Button type="primary" htmlType="submit" onClick={()=>onAddPOItoRoute(selectedPOI)}>
                                Add to Trip
                            </Button>
                             </div>
                        </div>
                    </InfoWindow>
                )}

                {directionReq && (
                    <DirectionsService
                        options={directionReq}
                        callback={directionsCallback}
                    />
                )}

                {response !== null && (
                    <DirectionsRenderer options={directionsRendererOptions} />
                )}

            </GoogleMap>
        </div>
    );
}

Map.propTypes = DirectionsPropTypes
// export default React.memo(Map)
export default Map
