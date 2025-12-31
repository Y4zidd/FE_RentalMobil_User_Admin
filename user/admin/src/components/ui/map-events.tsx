'use client';

import { useMap, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.locatecontrol';

type LatLngTuple = [number, number];

export function MapViewUpdater({ center, zoom }: { center: LatLngTuple; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        duration: 2,
        easeLinearity: 0.5
      });
    }
  }, [center, zoom, map]);

  return null;
}

export function MapLocateControlImpl({ position = 'topleft' }: { position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright' }) {
  const map = useMap();

  useEffect(() => {
    const locateControl = L.control.locate({
      position,
      flyTo: true,
      showPopup: false,
      strings: {
        title: 'Show me where I am'
      },
      onLocationError: (err) => {
        console.error(err);
      }
    });

    locateControl.addTo(map);

    return () => {
      locateControl.remove();
    };
  }, [map, position]);

  return null;
}

export function MapClickHandlerImpl({ onClick }: { onClick: (position: LatLngTuple) => void }) {
  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
    }
  });

  return null;
}
