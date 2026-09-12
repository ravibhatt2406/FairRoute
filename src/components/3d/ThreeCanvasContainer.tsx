'use client';

import LogisticsWorldThreeNative from './LogisticsWorldThreeNative';

export default function ThreeCanvasContainer({
  onHoverCommunity,
  onHoverVehicle,
}: {
  onHoverCommunity: (c: any) => void;
  onHoverVehicle: (v: any) => void;
}) {
  return (
    <LogisticsWorldThreeNative
      onHoverCommunity={onHoverCommunity}
      onHoverVehicle={onHoverVehicle}
    />
  );
}
