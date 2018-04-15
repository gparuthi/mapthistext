import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import { Button, Intent, Spinner, Navbar, NavbarGroup, NavbarHeading, NavbarDivider, Alignment, Card, Elevation, NonIdealState, Icon, EditableText, Toast, Toaster } from "@blueprintjs/core";
import { Colors, Text, Classes } from "@blueprintjs/core"
//@ts-ignore
import Geocode from "react-geocode";

import './index.css';
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

import { INIT_TEXT } from './helpers';

import GoogleMap from 'google-map-react';

import {geolocated, GeolocatedProps} from 'react-geolocated';

Geocode.setApiKey("AIzaSyC9_o0oJQXpFqAtoj6I0W4bXsTSBq3bmi4");
Geocode.enableDebug();


class ContentModel {
  @observable text: string

  constructor(text = "") {
    this.text = text
  }
}
interface coordinates {
  lat: number,
  lng: number
}

interface MapMarker {
  name: string;
  coordinates: coordinates;
}

class AppState {
  @observable currentContent: ContentModel
  @observable mapMarkers: Array<MapMarker>
  @observable mapCenter = {
    lat: 37.78825, lng: -122.4324
  }
  @observable currentLocation : {lat: number, lng: number}
  @observable isBusy = false;
  @observable selectedMarker: MapMarker;

  constructor() {
    this.currentContent = new ContentModel()
    this.mapMarkers = []
    setTimeout(() => {
      this.getCurrentLocation()
    }, 1000);
    
  }

  getCurrentLocation(){
    console.log('here2')
    const options = { maximumAge: 60000, timeout: 10000, enableHighAccuracy: true };
    navigator.geolocation.getCurrentPosition(function () { }, function () { }, {});
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        var crd = pos.coords;
        console.log('current pos', crd)
        this.currentLocation = {lat:crd.latitude, lng: crd.longitude}
        this.mapCenter = this.currentLocation
       }, 
      (error) => {
        console.log('error', error)
       },
       options)
  }

  processLines(lines: string[]) {
    this.isBusy = true;
    // get geocoded addresses
    lines.map((line: string) => {
      Geocode.fromAddress(line).then(
        (response: any) => {
          const { lat, lng } = response.results[0].geometry.location;
          console.log(line, lat, lng);
          if (this.mapMarkers.length === 0){
            this.mapCenter = { lat: lat, lng: lng }
          }
          this.mapMarkers.push({ name: line, coordinates: { lat: lat, lng: lng } })
        },
        (error: any) => {
          console.error(error);
        }
      );
    })
  }
}

interface Props{
  store: AppState
}

class MapMarkerView extends React.Component<any> {
  render() {
    return (
      <div onClick={this.props.onPress} className={'marker'}></div>
    );
  }
}
class UserLocationBlueDot extends React.Component<any> {
  render() {
    return (
      <div className={'bluedot'}></div>
    );
  }
}
class Demo extends React.Component<GeolocatedProps, {}> {
  render(): JSX.Element {
    console.log('here', this.props)
    return (
      <UserLocationBlueDot lat={this.props.coords.latitude} lng={this.props.coords.longitude} />
    );
  }
}
@observer
export class App extends React.Component<Props>{
  
  render() {
    const store = this.props.store
    const onStartClick = () => {
      const lines = store.currentContent.text.split(/\n/)
      store.processLines(lines)
    }
    const markerOnPress = (marker: MapMarker) => {
      store.selectedMarker = marker
      console.log(marker.name, marker.coordinates)
    }
    const onTextEdit = (value: string) => {
      store.currentContent.text = value
      onStartClick()
    }
    return (
      <div className={Classes.DARK} style={{minHeight: '1500px'}}>
        <Navbar>
          <NavbarGroup align={Alignment.CENTER}>
            <NavbarHeading>Map this text</NavbarHeading>
          </NavbarGroup>
        </Navbar>
        
        <div className='content'>
         <div className='container'>
         <div className='column'>
              <Card className="textinput-card" interactive={false}>
                <EditableText multiline 
                minLines={12} 
                value={store.currentContent.text} 
                onChange={onTextEdit} 
                onConfirm={onStartClick} 
                placeholder={"Paste any text that has locations. Each location in a new line."}
                />
              </Card>
         </div>
            

        <div className='column'>
              { store.selectedMarker &&
                <Card className="selectedPlace" interactive={false}>
                <Text >{store.selectedMarker.name}</Text>
              </Card>
              }
              <GoogleMap
                bootstrapURLKeys={{ key: 'AIzaSyCjXWv_TJqX54dZeLgO0aE3aI5Oll4efuM' }}
                center={store.mapCenter}
                zoom={9}
              >
              { store.currentLocation &&
                  <UserLocationBlueDot lat={store.currentLocation.lat} lng={store.currentLocation.lng} />
              }
                
                  {store.mapMarkers.map((marker, index) => (
                    <MapMarkerView onPress={()=> {markerOnPress(marker)}} key={index}  lat={marker.coordinates.lat} lng={marker.coordinates.lng} />
                  )
                  )
                }
              </GoogleMap>
          </div>
            
         </div>
          
          {/* <Button onClick={onStartClick}>Start</Button> */}
    </div>
      
        
      </div>
    )
  }
}

ReactDOM.render(
  <App store={ new AppState() }/>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
