'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const dictionary = {
  en: {
    title: 'List Your Homestay',
    sub: 'Fill out the details below to publish your property to our directory map.',
    lTitle: 'HOMESTAY TITLE',
    lDesc: 'DESCRIPTION',
    lLocality: 'LOCALITY (NEIGHBORHOOD)',
    lPrice: 'PRICE PER NIGHT (₹)',
    lBedrooms: 'NUMBER OF BEDROOMS',
    lBathrooms: 'BATHROOMS',
    lAmenities: 'AMENITIES (WHAT THIS PLACE OFFERS)',
    lImages: 'PROPERTY IMAGES (EXACTLY 4)',
    lHostName: 'FULL NAME',
    lHostPhone: 'PHONE NUMBER',
    lHostPhoto: 'HOST PROFILE PHOTO',
    btn: 'Publish Listing',
    success: 'Property listed successfully and sent for verification!',
    footer: '© 2026 StayGuwahati Platform Unified Core Engine. All rights reserved.'
  },
  as: {
    title: 'আপোনাৰ হোমষ্টে তালিকাভুক্ত কৰক',
    sub: 'আমাৰ ডাইৰেক্টৰী মানচিত্ৰত আপোনাৰ সম্পত্তি প্ৰকাশ কৰিবলৈ তলৰ বিৱৰণসমূহ পূৰণ কৰক।',
    lTitle: 'হোমষ্টে শীৰ্ষক',
    lDesc: 'বিৱৰণ',
    lLocality: 'এলাকা',
    lPrice: 'প্ৰতি ৰাতিৰ মূল্য (₹)',
    lBedrooms: 'শোৱা কোঠা (Bedrooms)',
    lBathrooms: 'বাথৰুম',
    lAmenities: 'সুবিধাসমূহ (এই স্থানত কি কি পোৱা যায়)',
    lImages: 'সম্পত্তিৰ ছবি (ঠিক ৪ খন)',
    lHostName: 'সম্পূৰ্ণ নাম',
    lHostPhone: 'ফোন নম্বৰ',
    lHostPhoto: 'হোষ্টৰ প্ৰফাইল ফটো',
    btn: 'তালিকা প্ৰকাশ কৰক',
    success: 'সম্পত্তি সফলতাৰে তালিকাভুক্ত কৰা হৈছে!',
    footer: '© ২০২৬ ষ্টেগুৱাহাটী প্লেটফৰ্ম ইউনিফাইড কোৰ ইঞ্জিন। সৰ্বস্বত্ব সংৰক্ষিত।'
  },
  hi: {
    title: 'अपनी होमस्टे सूचीबद्ध करें',
    sub: 'हमारे निर्देशिका मानचित्र पर अपनी संपत्ति प्रकाशित करने के लिए नीचे दिए गए विवरण भरें।',
    lTitle: 'होमस्टे शीर्षक',
    lDesc: 'विवरण',
    lLocality: 'स्थान',
    lPrice: 'प्रति रात्रि मूल्य (₹)',
    lBedrooms: 'बेडरूम की संख्या',
    lBathrooms: 'बाथरूम',
    lAmenities: 'सुविधाएं (इस स्थान पर क्या उपलब्ध है)',
    lImages: 'संपत्ति छवियां (ठीक 4)',
    lHostName: 'पूरा नाम',
    lHostPhone: 'फोन नंबर',
    lHostPhoto: 'होस्ट प्रोफाइल फ़ोटो',
    btn: 'लिस्टिंग प्रकाशित करें',
    success: 'संपत्ति सफलतापूर्वक सूचीबद्ध हो गई!',
    footer: '© 2026 स्टेगुवाहाटी प्लेटफॉर्म यूनिफाइड कोर इंजन। सर्वाधिकार सुरक्षित।'
  }
};

const localities = [
  'Amingaon', 'Azara', 'Bamunimaidam', 'Basistha', 'Beltola',
  'Bhangagarh', 'Borjhar', 'Chandmari', 'Christian Basti', 'Dispur',
  'Ganeshguri', 'Geetanagar', 'GS Road', 'Jalukbari', 'Kahilipara',
  'Kamakhya', 'Khanapara', 'Kharghuli', 'Lal Ganesh', 'Lokhra',
  'Maligaon', 'Narengi', 'Paltan Bazar', 'Pan Bazar', 'Rehabari',
  'Rukminigaon', 'Silpukhuri', 'Six Mile', 'Supermarket', 'Ulubari',
  'Uzan Bazar', 'Zoo Road'
];

const standardAmenities = [
  { id: 'wifi', label: 'Fast wifi', icon: '📶' },
  { id: 'tv', label: 'HDTV with Netflix', icon: '📺' },
  { id: 'parking', label: 'Free parking', icon: '🚗' },
  { id: 'pets', label: 'Pets allowed', icon: '🐶' },
  { id: 'ac', label: 'Air conditioning', icon: '❄️' },
  { id: 'kitchen', label: 'Kitchen access', icon: '🍳' },
];

export default function ListPropertyPage() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState<'en' | 'as' | 'hi'>('en');
  const [step, setStep] = useState(1);
  const steps = [
    { number: 1, title: 'Your stay', hint: 'The essentials' },
    { number: 2, title: 'Make it yours', hint: 'Amenities & photos' },
    { number: 3, title: 'Pin the place', hint: 'Exact location' },
    { number: 4, title: 'Meet the host', hint: 'Review & publish' },
  ];
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState<number>(2);

  // Bathroom breakdown used by the backend schema.
  // We keep the three real bathroom types instead of inventing fractional totals.
  const [bathrooms, setBathrooms] = useState({
    privateAttached: 0,
    dedicated: 0,
    shared: 0,
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  
  // Host Contact State
  const [hostName, setHostName] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [hostPhoto, setHostPhoto] = useState<string | null>(null);
  const [hostPhotoFile, setHostPhotoFile] = useState<File | null>(null);

  // Property Image Handling State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Camera state. Using getUserMedia gives Android users a real camera
  // experience instead of relying on browser-specific <input capture> behavior.
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'property' | 'host'>('property');
  const [cameraError, setCameraError] = useState('');
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [photoPickerTarget, setPhotoPickerTarget] = useState<'property' | 'host'>('property');

  const propertyFileInputRef = useRef<HTMLInputElement | null>(null);
  const hostFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stayguwahati-backend.onrender.com';
  const t = dictionary[currentLang] || dictionary.en;

  // Dynamic fallback avatar using ui-avatars.com if no photo exists
  const generatedDefaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName || 'Host')}&background=0d9488&color=fff&size=128`;

  useEffect(() => {
    const savedLang = (localStorage.getItem('preferredLanguage') as 'en' | 'as' | 'hi') || 'en';
    setCurrentLang(savedLang);

    try {
      const currentUser = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (currentUser.name) setHostName(currentUser.name);
      if (currentUser.email) setUserEmail(currentUser.email);
      if (currentUser.avatar || currentUser.photo || currentUser.image) {
        const rawProfileAvatar = currentUser.avatar || currentUser.photo || currentUser.image;
        setHostPhoto(rawProfileAvatar.startsWith('/') ? `${API_BASE_URL}${rawProfileAvatar}` : rawProfileAvatar);
      }
    } catch (e) {
      console.warn('Failed to parse user profile from localStorage:', e);
    }
  }, [API_BASE_URL]);

  // Cleanup Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as 'en' | 'as' | 'hi';
    setCurrentLang(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const handleAmenityToggle = (label: string) => {
    if (selectedAmenities.includes(label)) {
      setSelectedAmenities(selectedAmenities.filter((item) => item !== label));
    } else {
      setSelectedAmenities([...selectedAmenities, label]);
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCameraError('');
  };

  const openCamera = async (target: 'property' | 'host') => {
    setCameraTarget(target);
    setCameraError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Camera access is not supported by this browser. Please use the photo picker and choose Photo Library or Files instead.'
      );
      setCameraOpen(true);
      return;
    }

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: target === 'property' ? 'environment' : 'user' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setCameraOpen(true);

      // Wait until the modal/video element is mounted.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      });
    } catch (error: any) {
      console.error('Camera access failed:', error);
      setCameraError(
        error?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access in your browser settings and try again.'
          : 'Could not open the camera. Please use the photo picker and choose Photo Library or Files instead.'
      );
      setCameraOpen(true);
    }
  };

  const takeCameraPhoto = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera is not ready yet. Please wait a moment and try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    const maxWidth = 1600;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('Could not capture the photo. Please try again.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Could not create the photo file. Please try again.');
        return;
      }

      const fileName = `stayguwahati-${cameraTarget}-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      if (cameraTarget === 'host') {
        if (hostPhoto?.startsWith('blob:')) {
          URL.revokeObjectURL(hostPhoto);
        }
        setHostPhotoFile(file);
        setHostPhoto(URL.createObjectURL(file));
        closeCamera();
        return;
      }

      // Property camera captures one photo at a time so the host can take
      // four separate shots, just like the requested mobile workflow.
      if (selectedFiles.length >= 4) {
        setImageError('You already have exactly 4 images. Remove one before adding another.');
        closeCamera();
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setSelectedFiles((current) => [...current, file]);
      setPreviews((current) => [...current, previewUrl]);

      const total = selectedFiles.length + 1;
      setImageError(
        total < 4
          ? `Please add ${4 - total} more image${4 - total === 1 ? '' : 's'}.`
          : null
      );

      closeCamera();
    }, 'image/jpeg', 0.9);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const bathroomTotal =
    bathrooms.privateAttached + bathrooms.dedicated + bathrooms.shared;

  const updateBathroom = (
    type: 'privateAttached' | 'dedicated' | 'shared',
    delta: number
  ) => {
    setBathrooms((current) => ({
      ...current,
      [type]: Math.max(0, Math.min(10, current[type] + delta)),
    }));
  };

  const openPhotoPicker = (target: 'property' | 'host') => {
    setPhotoPickerTarget(target);
    setPhotoPickerOpen(true);
  };

  const closePhotoPicker = () => {
    setPhotoPickerOpen(false);
  };

  const choosePhotoLibrary = () => {
    closePhotoPicker();

    requestAnimationFrame(() => {
      if (photoPickerTarget === 'host') {
        hostFileInputRef.current?.click();
      } else {
        propertyFileInputRef.current?.click();
      }
    });
  };

  const choosePhotoCamera = () => {
    closePhotoPicker();
    requestAnimationFrame(() => {
      openCamera(photoPickerTarget);
    });
  };

  const chooseFiles = () => {
    closePhotoPicker();

    requestAnimationFrame(() => {
      if (photoPickerTarget === 'host') {
        hostFileInputRef.current?.click();
      } else {
        propertyFileInputRef.current?.click();
      }
    });
  };

  const handleHostPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (hostPhoto?.startsWith('blob:')) {
        URL.revokeObjectURL(hostPhoto);
      }
      setHostPhotoFile(file);
      setHostPhoto(URL.createObjectURL(file));
      e.target.value = '';
    }
  };

  const addPropertyImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    const remainingSlots = 4 - selectedFiles.length;

    if (remainingSlots <= 0) {
      setImageError('You already have exactly 4 images. Remove one before adding another.');
      e.target.value = '';
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const newPreviewUrls = filesToAdd.map((file) => URL.createObjectURL(file));

    setSelectedFiles((current) => [...current, ...filesToAdd]);
    setPreviews((current) => [...current, ...newPreviewUrls]);

    const total = selectedFiles.length + filesToAdd.length;

    if (files.length > remainingSlots) {
      setImageError('Only 4 property images are allowed. Extra images were not added.');
    } else if (total < 4) {
      const remaining = 4 - total;
      setImageError(`Please add ${remaining} more image${remaining === 1 ? '' : 's'}.`);
    } else {
      setImageError(null);
    }

    e.target.value = '';
  };

  const removePropertyImage = (index: number) => {
    setSelectedFiles((current) => current.filter((_, i) => i !== index));

    setPreviews((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed);
      return current.filter((_, i) => i !== index);
    });

    const remaining = 4 - (selectedFiles.length - 1);
    setImageError(
      `Please add ${remaining} more image${remaining === 1 ? '' : 's'}.`
    );
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        'Your browser does not support GPS location. Please enter the coordinates manually.'
      );
      return;
    }

    setLocationLoading(true);
    setLocationMessage('Getting your high-accuracy GPS location…');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLat = position.coords.latitude.toFixed(6);
        const nextLng = position.coords.longitude.toFixed(6);

        setLat(nextLat);
        setLng(nextLng);
        setLocationMessage(
          position.coords.accuracy
            ? `Location selected. Approximate GPS accuracy: ${Math.round(
                position.coords.accuracy
              )} metres.`
            : 'Location selected from your device GPS.'
        );
        setLocationLoading(false);
      },
      (error) => {
        let message =
          'Could not get your location. Please enter latitude and longitude manually.';

        if (error.code === error.PERMISSION_DENIED) {
          message =
            'Location permission was denied. Allow location access in your browser/phone settings and try again.';
        } else if (error.code === error.TIMEOUT) {
          message =
            'GPS timed out. Move outdoors or near a window and try again.';
        }

        setLocationMessage(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  const openLocationInMaps = () => {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (
      !Number.isFinite(parsedLat) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      !Number.isFinite(parsedLng) ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      alert('Please enter valid latitude and longitude first.');
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length !== 4) {
      setImageError('You must select exactly 4 images.');
      return;
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (
      !Number.isFinite(parsedLat) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      !Number.isFinite(parsedLng) ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      alert('Please select or enter a valid property latitude and longitude.');
      return;
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Please enter a valid price per night.');
      return;
    }

    setSubmitting(true);

    try {
      let uploadedImageUrls: string[] = [];
      let uploadedHostAvatarUrl = '';

      // 1. Upload Host Profile Avatar if a new file was explicitly selected
      if (hostPhotoFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('photos', hostPhotoFile);

        const avatarRes = await fetch(`${API_BASE_URL}/api/upload-images`, {
          method: 'POST',
          body: avatarFormData,
        });

        if (!avatarRes.ok) {
          throw new Error(`Host profile photo upload failed with status ${avatarRes.status}.`);
        }

        const avatarData = await avatarRes.json();
        const rawAvatarUrl = 
          avatarData.images?.[0] || 
          avatarData.urls?.[0] || 
          avatarData.url || 
          avatarData.image || 
          avatarData.filePath || 
          avatarData.file?.url || '';

        if (!rawAvatarUrl) {
          throw new Error('Host photo upload succeeded but returned no valid URL.');
        }

        uploadedHostAvatarUrl = rawAvatarUrl.startsWith('/') ? `${API_BASE_URL}${rawAvatarUrl}` : rawAvatarUrl;
      } else if (hostPhoto && !hostPhoto.startsWith('blob:') && !hostPhoto.startsWith('data:')) {
        // Use existing non-blob host photo URL if available
        uploadedHostAvatarUrl = hostPhoto;
      } else {
        // Fallback to generated initials avatar only if no photo was uploaded or provided
        uploadedHostAvatarUrl = generatedDefaultAvatar;
      }

      // 2. Upload Property Images to Backend Upload Endpoint
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('photos', file));

      const uploadRes = await fetch(`${API_BASE_URL}/api/upload-images`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error(`Property image upload failed with status ${uploadRes.status}. Please ensure image server is online.`);
      }

      const uploadData = await uploadRes.json();
      if (uploadData.success && Array.isArray(uploadData.images)) {
        uploadedImageUrls = uploadData.images;
      } else if (Array.isArray(uploadData.urls)) {
        uploadedImageUrls = uploadData.urls;
      }

      if (uploadedImageUrls.length === 0) {
        throw new Error('Image upload succeeded but returned no valid URLs.');
      }

      // Ensure property image URLs are absolute
      uploadedImageUrls = uploadedImageUrls.map((imgUrl) => 
        imgUrl.startsWith('/') ? `${API_BASE_URL}${imgUrl}` : imgUrl
      );

      // 3. Construct clean property object matching backend schema rules
      const newProperty = {
        title: title.trim(),
        description: description.trim(),
        locality: locality,
        pricePerNight: parsedPrice,
        bedrooms,
        bathrooms: {
          privateAttached: bathrooms.privateAttached,
          dedicated: bathrooms.dedicated,
          shared: bathrooms.shared,
          total: bathroomTotal,
        },
        lat: isNaN(parsedLat) ? 26.1445 : parsedLat,
        lng: isNaN(parsedLng) ? 91.7362 : parsedLng,
        images: uploadedImageUrls,
        features: selectedAmenities,
        host: {
          name: hostName.trim(),
          email: userEmail.trim() || 'user@example.com',
          phone: hostPhone.trim(),
          avatar: uploadedHostAvatarUrl,
        },
        status: 'pending'
      };

      // 4. LocalStorage Backup
      try {
        const localProps = JSON.parse(localStorage.getItem('userProperties') || '[]');
        localProps.push(newProperty);
        localStorage.setItem('userProperties', JSON.stringify(localProps));
      } catch (storageError) {
        console.warn('LocalStorage backup skipped:', storageError);
      }

      // 5. Post Listing JSON to backend API
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/api/homestays`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newProperty)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let detailMsg = errorData.message || errorData.error || `Server responded with status ${response.status}`;
        
        if (Array.isArray(errorData.errors)) {
          detailMsg += `: ${errorData.errors.map((e: any) => e.message || e.msg || JSON.stringify(e)).join(', ')}`;
        } else if (typeof errorData.errors === 'object' && errorData.errors !== null) {
          detailMsg += `: ${JSON.stringify(errorData.errors)}`;
        }
        
        throw new Error(detailMsg);
      }

      alert(t.success);
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Error submitting listing:', error);
      alert(`Submission failed: ${error.message || 'Server error. Please check your network connection.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f6f3ed] min-h-screen font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-0">
          <div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
            onClick={() => router.push('/')}
          >
            <span className="text-xl sm:text-2xl">🏠</span>
            <span className="text-lg sm:text-xl font-bold text-teal-800">StayGuwahati</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <select
              value={currentLang}
              onChange={handleLangChange}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl p-1.5 focus:outline-none focus:border-teal-500 cursor-pointer transition"
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
          <section className="rounded-[32px] bg-gradient-to-br from-[#103b36] via-[#173f3a] to-[#356b62] text-white px-6 py-8 sm:px-10 sm:py-12 shadow-[0_20px_55px_rgba(23,63,58,.16)]">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[.18em] uppercase">Host journey</span>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
              <div>
                <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">{t.title}</h1>
                <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#d8e7e1]">{t.sub}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/10 p-4">
                <p className="text-xs text-[#cfe0da]">Step {step} of 4</p>
                <p className="mt-1 text-lg font-semibold">{steps[step - 1].title}</p>
                <div className="mt-3 flex gap-1.5">{steps.map((item) => <span key={item.number} className={`h-1.5 flex-1 rounded-full ${item.number <= step ? 'bg-[#f3c34c]' : 'bg-white/20'}`} />)}</div>
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="hidden lg:block rounded-3xl border border-[#d6dfd9] bg-white/75 p-4 h-fit sticky top-24">
              <p className="px-3 pb-3 text-[10px] font-bold tracking-[.16em] uppercase text-[#58706a]">Your listing</p>
              <div className="space-y-1">
                {steps.map((item) => (
                  <button key={item.number} type="button" onClick={() => setStep(item.number)}
                    className={`w-full rounded-2xl px-3 py-3 text-left transition ${step === item.number ? 'bg-[#173f3a] text-white shadow-sm' : 'text-[#46605a] hover:bg-[#edf2ee]'}`}>
                    <span className="block text-sm font-semibold">{item.number}. {item.title}</span>
                    <span className={`block mt-0.5 text-[11px] ${step === item.number ? 'text-[#cfe0da]' : 'text-[#8a9b96]'}`}>{item.hint}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="rounded-[30px] border border-[#d6dfd9] bg-white shadow-[0_16px_45px_rgba(31,52,49,.07)] overflow-hidden">
              <div className="border-b border-[#e4e9e6] px-5 py-4 sm:px-7 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[.16em] uppercase text-[#3f776e]">Step {step}</p>
                  <h2 className="mt-1 text-xl font-semibold text-[#1f3431]">{steps[step - 1].title}</h2>
                </div>
                <span className="text-xs text-[#71817c]">{steps[step - 1].hint}</span>
              </div>
              <div className="p-5 sm:p-7"><form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {step === 1 && <div className="space-y-5">
            <div>
              <label className="block text-gray-400 font-medium mb-1">{t.lTitle}</label>
              <input
                type="text"
                required
                placeholder="e.g., Cozy Riverside Orchid Villa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2d756b]/20 focus:border-[#2d756b] font-medium text-gray-900"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-1">{t.lDesc}</label>
              <textarea
                rows={3}
                required
                placeholder="Describe the ambiance, amenities, and unique features..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2d756b]/20 focus:border-[#2d756b] font-medium text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-medium mb-1">{t.lLocality}</label>
                <select
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2d756b]/20 focus:border-[#2d756b] font-medium bg-white text-gray-900"
                >
                  <option value="" disabled>Select locality...</option>
                  {localities.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">{t.lPrice}</label>
                <input
                  type="number"
                  required
                  placeholder="2500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2d756b]/20 focus:border-[#2d756b] font-medium text-gray-900"
                />
              </div>
            </div>

            {/* Bedroom + Bathroom Selectors */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <label className="block text-gray-700 font-bold text-sm">{t.lBedrooms}</label>
                  <p className="text-gray-400 text-xs">Select how many bedrooms are available for guests.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 border border-gray-200 rounded-xl shadow-sm">
                  <button
                    type="button"
                    onClick={() => setBedrooms((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold flex items-center justify-center text-sm transition"
                  >
                    −
                  </button>
                  <div className="text-center min-w-[3.5rem]">
                    <span className="text-base font-extrabold text-gray-900">{bedrooms}</span>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Bedrooms</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBedrooms((prev) => Math.min(10, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-[#e7f0eb] hover:bg-[#dceae4] text-[#28655c] font-bold flex items-center justify-center text-sm transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <label className="block text-gray-700 font-bold text-sm">{t.lBathrooms}</label>
                    <p className="text-gray-400 text-xs">
                      Enter the actual number of bathrooms by type. Total: <span className="font-bold text-[#28655c]">{bathroomTotal}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: 'privateAttached' as const, label: 'Private & attached' },
                    { key: 'dedicated' as const, label: 'Dedicated' },
                    { key: 'shared' as const, label: 'Shared' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl p-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{item.label}</p>
                        <p className="text-[10px] text-gray-400">Bathrooms</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateBathroom(item.key, -1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold flex items-center justify-center"
                          aria-label={`Decrease ${item.label} bathrooms`}
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-extrabold text-gray-900">
                          {bathrooms[item.key]}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateBathroom(item.key, 1)}
                          className="w-7 h-7 rounded-lg bg-[#e7f0eb] hover:bg-[#dceae4] text-[#28655c] font-bold flex items-center justify-center"
                          aria-label={`Increase ${item.label} bathrooms`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            </div>}
            {step === 2 && <div className="space-y-5">
            {/* Amenities Selection */}
            <div>
              <label className="block text-gray-400 font-medium mb-2 uppercase tracking-wide">
                {t.lAmenities}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {standardAmenities.map((item) => {
                  const isChecked = selectedAmenities.includes(item.label);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAmenityToggle(item.label)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left transition font-medium cursor-pointer ${
                        isChecked
                          ? 'border-teal-600 bg-[#e7f0eb]/60 text-teal-900 shadow-sm'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-xs truncate">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="ml-auto text-[#28655c] rounded focus:ring-teal-500 h-3.5 w-3.5"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-gray-400 font-medium mb-1 uppercase tracking-wide">
                {t.lImages}
              </label>

              <div className={`rounded-2xl p-4 sm:p-5 transition ${
                imageError
                  ? 'border-2 border-rose-300 bg-rose-50/30'
                  : 'border-2 border-dashed border-[#b8d2c8] bg-[#e7f0eb]/30'
              }`}>
                <button
                  type="button"
                  onClick={() => openPhotoPicker('property')}
                  disabled={selectedFiles.length >= 4}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#173f3a] hover:bg-[#28655c] text-white font-bold py-3 px-4 cursor-pointer transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📷 <span>Add / choose property photos</span>
                </button>

                <input
                  ref={propertyFileInputRef}
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={addPropertyImages}
                  className="hidden"
                />

                <p className="text-center text-gray-400 text-xs mt-3">
                  Add exactly 4 property photos. One button gives you Camera, Photo Library and Files
                  on Android, iPhone and desktop.
                </p>

                {previews.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                    {previews.map((src, idx) => (
                      <div
                        key={`${src}-${idx}`}
                        className="relative h-28 sm:h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white"
                      >
                        <img
                          src={src}
                          alt={`Property preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {idx === 0 && (
                          <span className="absolute left-1.5 top-1.5 bg-[#173f3a]/80 text-white text-[9px] font-bold rounded-full px-2 py-1">
                            COVER
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => removePropertyImage(idx)}
                          className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-red-600 text-white font-bold shadow flex items-center justify-center"
                          aria-label={`Remove property image ${idx + 1}`}
                        >
                          ×
                        </button>

                        <span className="absolute bottom-1.5 left-1.5 bg-white/90 text-gray-700 text-[9px] font-bold rounded px-1.5 py-0.5">
                          {idx + 1}/4
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#dceae4] flex items-center justify-center text-2xl">
                      📷
                    </div>
                    <p className="font-bold text-gray-800 text-sm mt-2">
                      Add your 4 property photos
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Bedroom, living area, exterior and bathroom photos are recommended.
                    </p>
                  </div>
                )}
              </div>

              {imageError && (
                <p className="text-rose-500 text-xs mt-1.5 font-semibold">
                  ⚠️ {imageError}
                </p>
              )}

              {selectedFiles.length > 0 && !imageError && (
                <p className="text-[#28655c] text-xs mt-1.5 font-semibold">
                  ✓ {selectedFiles.length}/4 image(s) selected
                </p>
              )}
            </div>

            </div>}
            {step === 3 && <div className="space-y-5">
            {/* Exact Property Location */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#dceae4] flex items-center justify-center text-lg shrink-0">
                  📍
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">EXACT PROPERTY LOCATION</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Stand at the property and use your phone GPS to automatically select its coordinates.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locationLoading}
                className="w-full bg-[#173f3a] hover:bg-[#28655c] text-white font-bold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {locationLoading ? '⏳ Getting GPS location…' : '📍 Use my current location'}
              </button>

              {locationMessage && (
                <div className="mt-3 rounded-xl bg-[#e7f0eb] border border-teal-100 px-3 py-2.5 text-xs font-semibold text-teal-800">
                  {locationMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">
                    LATITUDE COORDINATE
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.000001"
                    min="-90"
                    max="90"
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="e.g. 26.144500"
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2d756b]/20 focus:border-[#2d756b] font-medium text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">
                    LONGITUDE COORDINATE
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.000001"
                    min="-180"
                    max="180"
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="e.g. 91.736200"
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2d756b]/20 focus:border-[#2d756b] font-medium text-gray-900 bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={openLocationInMaps}
                className="w-full mt-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl border border-gray-200 transition text-xs"
              >
                🗺️ Verify this location on Google Maps
              </button>

              <p className="text-gray-400 text-[11px] leading-5 mt-3">
                GPS accuracy depends on the phone and surroundings. You can manually adjust the
                coordinates before publishing if required.
              </p>
            </div>

            </div>}
            {step === 4 && <div className="space-y-5">
            {/* Host Profile Section */}
            <div className="pt-4 border-t border-gray-100">
              <p className="font-bold text-gray-900 mb-3">🛡️ Host Information</p>
              
              {/* Host Photo Upload UI */}
              <div className="mb-4 flex items-center gap-4 p-3 border border-gray-100 bg-slate-50/50 rounded-2xl">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                  <img 
                    src={hostPhoto || generatedDefaultAvatar} 
                    alt="Host Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-bold mb-0.5">{t.lHostPhoto}</label>
                  <p className="text-gray-400 text-[11px] mb-2">Upload a photo, or we will automatically generate an initial avatar from your name.</p>
                  <button
                    type="button"
                    onClick={() => openPhotoPicker('host')}
                    className="inline-flex items-center gap-1.5 bg-[#173f3a] hover:bg-[#28655c] text-white font-semibold px-4 py-2 rounded-xl border border-teal-600 text-xs cursor-pointer shadow-sm transition"
                  >
                    📷 Add / change host photo
                  </button>

                  <input
                    ref={hostFileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleHostPhotoChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">{t.lHostName}</label>
                  <input
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2d756b]/20 focus:border-[#2d756b] font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">{t.lHostPhone}</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit mobile number"
                    value={hostPhone}
                    onChange={(e) => setHostPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2d756b]/20 focus:border-[#2d756b] font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>

            </div>}

            <div className="flex items-center justify-between gap-3 border-t border-[#e4e9e6] pt-5">
              <button type="button" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}
                className="rounded-xl border border-[#bfd0ca] px-5 py-3 text-sm font-semibold text-[#31554e] disabled:opacity-40">
                ← Back
              </button>
              {step < 4 ? (
                <button type="button" onClick={() => setStep((value) => Math.min(4, value + 1))}
                  className="rounded-xl bg-[#173f3a] px-6 py-3 text-sm font-bold text-white hover:bg-[#28655c]">
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#f3c34c] px-6 py-3 text-sm font-bold text-[#173f3a] hover:bg-[#ffd66a] disabled:opacity-50"
                >
                  ☁️ {submitting ? 'Processing...' : t.btn}
                </button>
              )}
            </div>
          </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Unified photo picker. The same UI is used on Android, iPhone and desktop. */}
      {photoPickerOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-picker-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 id="photo-picker-title" className="font-black text-gray-900">
                    {photoPickerTarget === 'host' ? 'Add host photo' : 'Add property photo'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Choose how you want to add the photo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePhotoPicker}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                  aria-label="Close photo picker"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2.5">
              <button
                type="button"
                onClick={choosePhotoCamera}
                disabled={photoPickerTarget === 'property' && selectedFiles.length >= 4}
                className="w-full flex items-center gap-3 rounded-xl border border-[#b8d2c8] bg-[#e7f0eb] hover:bg-[#dceae4] px-4 py-3 text-left transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-2xl">📷</span>
                <span>
                  <span className="block text-sm font-bold text-gray-900">Take photo</span>
                  <span className="block text-[11px] text-gray-500">Use your device camera</span>
                </span>
              </button>

              <button
                type="button"
                onClick={choosePhotoLibrary}
                className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-4 py-3 text-left transition"
              >
                <span className="text-2xl">🖼️</span>
                <span>
                  <span className="block text-sm font-bold text-gray-900">Photo Library</span>
                  <span className="block text-[11px] text-gray-500">Choose photos from your gallery</span>
                </span>
              </button>

              <button
                type="button"
                onClick={chooseFiles}
                className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-4 py-3 text-left transition"
              >
                <span className="text-2xl">📁</span>
                <span>
                  <span className="block text-sm font-bold text-gray-900">Choose Files</span>
                  <span className="block text-[11px] text-gray-500">Select an image from your device files</span>
                </span>
              </button>

              <button
                type="button"
                onClick={closePhotoPicker}
                className="w-full rounded-xl bg-[#173f3a] hover:bg-slate-800 text-white font-bold py-3 mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cross-browser camera modal. This avoids Android Chrome/Samsung browser
          differences with <input capture> and gives the host an explicit camera UI. */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <h2 className="font-black text-gray-900">
                  {cameraTarget === 'host' ? 'Take host profile photo' : 'Take property photo'}
                </h2>
                <p className="text-[11px] text-gray-400">
                  {cameraTarget === 'host'
                    ? 'Position your face and tap Capture.'
                    : `Photo ${Math.min(selectedFiles.length + 1, 4)} of 4`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCamera}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                aria-label="Close camera"
              >
                ×
              </button>
            </div>

            {cameraError ? (
              <div className="p-6">
                <div className="rounded-xl bg-rose-50 border border-rose-100 text-rose-700 p-4 text-sm font-semibold">
                  {cameraError}
                </div>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="mt-4 w-full rounded-xl bg-[#173f3a] text-white font-bold py-3"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="bg-black aspect-[4/3] flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex gap-3">
                  <button
                    type="button"
                    onClick={closeCamera}
                    className="flex-1 rounded-xl border border-gray-200 py-3 font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={takeCameraPhoto}
                    className="flex-1 rounded-xl bg-[#173f3a] hover:bg-[#28655c] text-white py-3 font-black"
                  >
                    📷 Capture
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100 bg-white mt-12">
        {t.footer}
      </footer>
    </div>
  );
}