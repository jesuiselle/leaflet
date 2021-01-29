import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as L from 'leaflet';
import {Marker} from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  baseUrl = 'http://localhost:3000/data';

  constructor(private http: HttpClient) {
  }

  selectLocation(map: L.Map): any {
    map.on('click', <LeafletMouseEvent>(e: { latlng: L.LatLngExpression; }) => {
      const mp = new L.Marker(e.latlng).addTo(map);

      fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({
          name: '',
          image: '',
          coordinates: [mp.getLatLng().lng, mp.getLatLng().lat]
        })
      }).then(() => {
        this.makeMarkers(map);
      })
        .catch(err => {
          console.error(err);
        });
    });
  }

  makePopup(c: any): string {
    const i = 1;
    return `<div>
            <input type="text" name="locName" placeholder="Enter name" value="${c.name}" data-id="${c.id}"/>
            <input type="text" name="locImage" placeholder="Enter image url" value="${c.image}" data-id="${c.id}"/>
            </div>
            <img style="max-width: 100%;" src="${c.image}"/>
            <br>
            <button data-id="${c.id}">delete</button>`;
  }

  makeMarkers(map: L.Map): void {
    this.http.get(this.baseUrl).subscribe((res: any) => {
      const result = res.data;

      for (const data of result) {
        const lat = data.coordinates[0];
        const lon = data.coordinates[1];
        const marker = L.marker([lon, lat]).addTo(map);

        marker.bindPopup(this.makePopup(data))
          .on('popupopen', (popupEvent) => {

            const deleteButton = popupEvent.target
              .getPopup()
              .getElement()
              .querySelector('button');

            const editName = popupEvent.target
              .getPopup()
              .getElement()
              .querySelector('input[name=locName]');

            const editImage = popupEvent.target
              .getPopup()
              .getElement()
              .querySelector('input[name=locImage]');

            editImage.addEventListener('change', () => {
              data.image = editImage.value;
              this.updateData(data, () => this.updateMarkerPopup(marker, data));
              this.updateMarkerPopup(marker, data);
            });

            editName.addEventListener('change', () => {
              data.name = editName.value;
              this.updateData(data, () => this.updateMarkerPopup(marker, data));
            });

            deleteButton.addEventListener('click', () => {
              const id = deleteButton.dataset.id;
              this.deleteData(id, map, marker);
            });
          });
      }
    });
  }

  private deleteData(id: string, map: L.Map, marker: Marker): any {
    fetch(this.baseUrl + '/' + id, {
      method: 'DELETE'
    }).then((response) => {
      if (response) {
        map.removeLayer(marker);
      }
    }).catch(err => {
      console.error(err);
    });
  }

  private updateData(data: any, successCallback: any): any {
    fetch(this.baseUrl + '/' + data.id, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(data),
    })
      .then(successCallback)
      .catch(err => {
        console.error(err);
      });
  }

  private updateMarkerPopup(marker: Marker, content: any): any {
    marker.setPopupContent(this.makePopup(content));
  }
}
