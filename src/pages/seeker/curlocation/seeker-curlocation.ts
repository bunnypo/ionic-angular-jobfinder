import { Component , ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController, ViewController } from 'ionic-angular';
import { Config } from '../../../provider/config';
import { UtilService } from '../../../provider/util-service';
import { SeekerService } from '../../../provider/seeker-service';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;

@Component({
  selector: 'page-seeker-curlocation',
  templateUrl: 'seeker-curlocation.html'
})
export class SeekerCurLocationPage {

  @ViewChild('mapseekercurlocation') mapElement: ElementRef;
  map: any;
  marker: any;
  infowindow: any;
  user_setting: any;
  placesService:any;
  placedetails: any;

  constructor(public navCtrl: NavController, 
    public config: Config,
    public util: UtilService,
    public seekerService: SeekerService,
    public viewCtrl: ViewController,
    private geolocation: Geolocation,
    public loading: LoadingController) {
        
  }

  ionViewWillEnter() {
    this.placedetails = {
        address: '',
        lat: '',
        lng: '',
        components: {
            route: { set: false, short:'', long:'' },                           // calle 
            street_number: { set: false, short:'', long:'' },                   // numero
            sublocality_level_1: { set: false, short:'', long:'' },             // barrio
            locality: { set: false, short:'', long:'' },                        // localidad, ciudad
            administrative_area_level_2: { set: false, short:'', long:'' },     // zona/comuna/partido 
            administrative_area_level_1: { set: false, short:'', long:'' },     // estado/provincia 
            country: { set: false, short:'', long:'' },                         // pais
            postal_code: { set: false, short:'', long:'' },                     // codigo postal
            postal_code_suffix: { set: false, short:'', long:'' },              // codigo postal - sufijo
        }    
    };    
    this.user_setting = this.config.userinfo['user_setting'];
    console.log(this.user_setting);
    let self = this;
    if(this.user_setting == null || (this.user_setting != null && this.user_setting.setting_location_lat == '')) {
      this.geolocation.getCurrentPosition().then((resp) => {
        self.user_setting.setting_location_lat = resp.coords.latitude;
        self.user_setting.setting_location_lng = resp.coords.longitude;
        self.loadMap();
      }).catch((error) => {
        alert('The Geolocation service failed');
        self.user_setting = {setting_location_lat:'', setting_location_lng:''};
        self.user_setting.setting_location_lat = 22.285831;
        self.user_setting.setting_location_lng = 114.1582283;
        self.loadMap();
      });
    } else { 
      self.loadMap();
    }
  }
  
  loadMap(){
    
    let latLng = new google.maps.LatLng(this.user_setting.setting_location_lat, this.user_setting.setting_location_lng);
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({
        map: this.map,
        position: latLng
    });

    var self = this;
    this.infowindow = new google.maps.InfoWindow({
        map: this.map,
        position: latLng,
        content: self.user_setting.setting_location_address
    });
    this.infowindow.close();

    var geocoder = new google.maps.Geocoder();
    
    google.maps.event.addListener(this.marker, 'click', function() {
        self.infowindow.open(this.map, this);
    });

    google.maps.event.addListener(this.map, 'click', function(event) {
        self.marker.setPosition(event.latLng); 
        self.geocodePosition(geocoder, event.latLng);
        //this.map.setCenter(event.latLng);
        self.user_setting.setting_location_lat = event.latLng.lat(); self.user_setting.setting_location_lng = event.latLng.lng();
    });
    

  }

  geocodePosition(geocoder, pos) {
    var self = this;
    geocoder.geocode({
        latLng: pos
    }, function(responses) {
        if (responses && responses.length > 0) {
            self.infowindow.setContent(responses[0].formatted_address);
            self.user_setting.setting_location_address = responses[0].formatted_address;
        } else {
            self.infowindow.setContent('Cannot determine address at this location.');
        }
    });
  }
  
  done() {
    this.config.userinfo['user_setting'] = this.user_setting;
    this.viewCtrl.dismiss();
  }
  
  private getPlaceDetail(place_id:string):void {
      var self = this;
      var request = {
          query: place_id
      };
      this.placesService = new google.maps.places.PlacesService(this.map);
      this.placesService.textSearch(request, callback);
      function callback(place, status) { 
        if(place.length > 0) {
          place = place[0];
          if (status == google.maps.places.PlacesServiceStatus.OK) {
              self.marker.setPosition(place.geometry.location); 
              self.map.setCenter(place.geometry.location);
              self.infowindow.setContent(place.formatted_address);
              self.user_setting.setting_location_address = place.formatted_address;
              self.user_setting.setting_location_lat = place.geometry.location.lat(); self.user_setting.setting_location_lng = place.geometry.location.lng();
          } else {
              
          }
        }
      }
  }

  search(value) {
    this.getPlaceDetail(value);
  }
}
