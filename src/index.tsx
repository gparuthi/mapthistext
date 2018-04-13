import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import { Button, Intent, Spinner, Navbar, NavbarGroup, NavbarHeading, NavbarDivider, Alignment, Card, Elevation, NonIdealState, Icon, EditableText } from "@blueprintjs/core";
import { Colors, Text, Classes } from "@blueprintjs/core"
//@ts-ignore
import Geocode from "react-geocode";

import './index.css';
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

import { INIT_TEXT } from './helpers';

import GoogleMap from 'google-map-react';

Geocode.setApiKey("AIzaSyC9_o0oJQXpFqAtoj6I0W4bXsTSBq3bmi4");
Geocode.enableDebug();


class ContentModel {
  @observable text: string

  constructor(text = INIT_TEXT) {
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

  constructor() {
    this.currentContent = new ContentModel()
    this.mapMarkers = []
  }

  processLines(lines: string[]) {
    
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
@observer
export class App extends React.Component<Props>{
  
  render() {
    const store = this.props.store
    const onStartClick = () => {
      const lines = store.currentContent.text.split(/\n/)
      store.processLines(lines)
    }
    const markerOnPress = (marker: MapMarker) => {
      console.log('test123')
      console.log(marker)
    }
    return (
      <div className={Classes.DARK} style={{minHeight: '1500px'}}>
        <Navbar>
          <NavbarGroup align={Alignment.RIGHT}>
            <NavbarHeading>Test App</NavbarHeading>
            <NavbarDivider />
            <Button className="pt-minimal" icon="home" text="Home" />
            <Button className="pt-minimal" icon="document" text="Files" />
          </NavbarGroup>
        </Navbar>
        <div className='content'>
         <div className='container'>
         <div className='column'>
              <Card interactive={false} elevation={Elevation.FOUR}>
                <EditableText multiline minLines={3} value={INIT_TEXT} />
              </Card>
         </div>
            

        <div className='column'>
              <GoogleMap
                bootstrapURLKeys={{ key: 'AIzaSyCjXWv_TJqX54dZeLgO0aE3aI5Oll4efuM' }}
                center={store.mapCenter}
                zoom={9}
              >
               
                  {store.mapMarkers.map((marker, index) => (
                    <MapMarkerView key={index}  lat={marker.coordinates.lat} lng={marker.coordinates.lng} />
                  )
                  )
                }

                
              </GoogleMap>
          </div>
            
         </div>
          
          <Button onClick={onStartClick}>Start</Button>
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
