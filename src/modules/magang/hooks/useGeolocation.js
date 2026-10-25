import { useState, useEffect } from 'react';

export const useGeolocation = (options = { enableHighAccuracy: true, timeout: 10000 }) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolokasi tidak didukung oleh browser Anda.',
        loading: false,
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMsg = 'Gagal mengambil lokasi.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Izin lokasi ditolak. Harap izinkan akses lokasi di browser Anda.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Waktu permintaan lokasi habis.';
            break;
        }
        setLocation((prev) => ({
          ...prev,
          error: errorMsg,
          loading: false,
        }));
      },
      options
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { ...location, refetchLocation: getLocation };
};
