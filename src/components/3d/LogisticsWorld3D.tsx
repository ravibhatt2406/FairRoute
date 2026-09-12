'use client';

import LogisticsWorldThreeNative from './LogisticsWorldThreeNative';

export function LogisticsScene({
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
