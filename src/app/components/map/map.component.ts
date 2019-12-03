import {Component, HostListener, OnInit} from '@angular/core';
import {latLng, tileLayer, polygon, marker, icon} from 'leaflet';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  layers = null;
  icon = {
    icon: icon({
      iconSize: [ 25, 41 ],
      iconAnchor: [ 13, 41 ],
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png'
    })
  };
  options = {
    layers: [
      tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {maxZoom: 18, ext: 'png'})
    ],
    zoom: 14,
    center: latLng(48.507734269985384, 32.24607467651368)
  };

  // TODO delete on prod
  locationData = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getMapData();
  }

  getMapData() {
    this.http.get('assets/map-data.json').toPromise().then(data => {
      this.layers = [];
      for (const item of (data as any)) {
        this.layers.push(polygon(item.layer, {color: item.color, weight: 1}));
        for (const school of item.school) {
          this.layers.push(marker(school.location, this.icon).bindPopup(`<p class="new">${school.fullName}</p>`));
        }
      }
    });
  }


  getLocation(e) {
    console.clear();
    console.log(e.latlng.lat + ' , ' + e.latlng.lng);
    this.locationData.push([e.latlng.lat, e.latlng.lng])
    this.layers.push(marker([e.latlng.lat, e.latlng.lng], this.icon));
  }

  @HostListener('mouseover', ['$event']) onHover(e) {
    if (e.target.classList[0] === 'leaflet-interactive') {

      e.target.classList.add('active');
      e.target.onmouseout = () => {
        e.target.classList.remove('active');
      };
    }
  }

  generateDistrict() {
    this.layers.push(polygon(this.locationData, {color: 'black', weight: 1}));
    console.clear();
    console.log('district location- ', JSON.stringify(this.locationData))
    this.locationData = [];
  }
}
