'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import type {
  MapContainerProps,
  CircleMarkerProps,
  CircleProps,
  PolygonProps,
  PolylineProps,
  RectangleProps,
  TooltipProps
} from 'react-leaflet';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);
const Rectangle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Rectangle),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
);

const MapViewUpdater = dynamic(
  () => import('./map-events').then((mod) => mod.MapViewUpdater),
  { ssr: false }
);
const MapLocateControlImpl = dynamic(
  () => import('./map-events').then((mod) => mod.MapLocateControlImpl),
  { ssr: false }
);
const MapClickHandlerImpl = dynamic(
  () => import('./map-events').then((mod) => mod.MapClickHandlerImpl),
  { ssr: false }
);

type LatLngTuple = [number, number];

const INDONESIA_BOUNDS: [LatLngTuple, LatLngTuple] = [
  [-11, 94],
  [6, 141]
];

interface MapProps extends Omit<MapContainerProps, 'center'> {
  center: LatLngTuple;
  children?: ReactNode;
}

export function Map(props: MapProps) {
  const { center, children, className, ...rest } = props;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let active = true;

    setIsMounted(true);

    const setup = async () => {
      await Promise.all([
        import('leaflet/dist/leaflet.css'),
        import('leaflet.locatecontrol/dist/L.Control.Locate.min.css'),
        import('leaflet.locatecontrol')
      ]);

      const leafletModule = await import('leaflet');
      if (!active) {
        return;
      }

      const L = leafletModule.default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
      });
    };

    setup();

    return () => {
      active = false;
    };
  }, []);

  if (!isMounted) {
    return (
      <div className={cn('h-full w-full bg-muted animate-pulse', className)} />
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={rest.zoom ?? 5}
      scrollWheelZoom={rest.scrollWheelZoom ?? true}
      zoomControl={false}
      preferCanvas
      minZoom={rest.minZoom ?? 3}
      maxBounds={rest.maxBounds ?? INDONESIA_BOUNDS}
      maxBoundsViscosity={rest.maxBoundsViscosity ?? 1}
      className={cn('h-full w-full isolate z-0', className)}
      {...rest}
    >
      <MapViewUpdater center={center} zoom={rest.zoom ?? 5} />
      {children}
    </MapContainer>
  );
}

interface MapTileLayerProps {
  url?: string;
  attribution?: string;
}

const LIGHT_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DARK_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const LIGHT_ATTRIBUTION = '&copy; OpenStreetMap contributors';
const DARK_ATTRIBUTION =
  '&copy; OpenStreetMap contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>';

export function MapTileLayer(props: MapTileLayerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const url = props.url ?? (isDark ? DARK_TILE_URL : LIGHT_TILE_URL);
  const attribution =
    props.attribution ?? (isDark ? DARK_ATTRIBUTION : LIGHT_ATTRIBUTION);

  return <TileLayer url={url} attribution={attribution} />;
}

interface MapMarkerProps {
  position: LatLngTuple;
  children?: ReactNode;
}

export function MapMarker({ position, children }: MapMarkerProps) {
  return <Marker position={position}>{children}</Marker>;
}

interface MapPopupProps {
  children?: ReactNode;
}

export function MapPopup({ children }: MapPopupProps) {
  return <Popup>{children}</Popup>;
}

interface MapZoomControlProps {
  position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
}

export function MapZoomControl({ position = 'bottomright' }: MapZoomControlProps) {
  return <ZoomControl position={position} />;
}

export function MapLocateControl({ position = 'topleft' }: MapZoomControlProps) {
  return <MapLocateControlImpl position={position} />;
}

interface MapClickHandlerProps {
  onClick: (position: LatLngTuple) => void;
}

export function MapClickHandler({ onClick }: MapClickHandlerProps) {
  return <MapClickHandlerImpl onClick={onClick} />;
}

export function MapTooltip({ children, ...props }: TooltipProps) {
  return <Tooltip {...props}>{children}</Tooltip>;
}

export function MapCircle({ children, ...props }: CircleProps) {
  return <Circle {...props}>{children}</Circle>;
}

export function MapCircleMarker({ children, ...props }: CircleMarkerProps) {
  return <CircleMarker {...props}>{children}</CircleMarker>;
}

export function MapPolyline({ children, ...props }: PolylineProps) {
  return <Polyline {...props}>{children}</Polyline>;
}

export function MapPolygon({ children, ...props }: PolygonProps) {
  return <Polygon {...props}>{children}</Polygon>;
}

export function MapRectangle({ children, ...props }: RectangleProps) {
  return <Rectangle {...props}>{children}</Rectangle>;
}
