import React, { useState, useEffect } from 'react'
import {
  XMarkIcon,
  CheckIcon,
  UserIcon,
  SparklesIcon,
  SwatchIcon,
  EyeIcon,
  FaceSmileIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline'
import { useHabboAvatar } from './contexts/HabboAvatarContext'
import { HabboAvatar } from './models/Avatar.js'
import { useAuth } from './contexts/AuthContext.jsx'

const AvatarEditor = ({ isOpen, onClose }) => {
  const { avatarAssets, avatar: contextAvatar, updateAvatar } = useHabboAvatar();

  // Use the HabboAvatar class from context
  const [workingAvatar, setWorkingAvatar] = useState(null);

  const [mainTabs, setMainTabs] = useState([]);
  const [subTabs, setSubTabs] = useState({});
  const [colorsTest, setColorsTest] = useState([]);

  // Loading states
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const [isLoadingColor, setIsLoadingColor] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [loadingColorKey, setLoadingColorKey] = useState(null);
  const { userInfo } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState('body');
  const [activeSubTab, setActiveSubTab] = useState(userInfo?.gender?.toUpperCase() === 'M' ? 'male' : 'female');


  useEffect(() => {
    if (isOpen && contextAvatar) {
      // Create a copy to work with
      const copy = new HabboAvatar(contextAvatar._gender, { ...contextAvatar._figure });
      setWorkingAvatar(copy);
    }
  }, [isOpen, contextAvatar]);

  useEffect(() => {
    if (avatarAssets && avatarAssets._assetsIcons && userInfo && userInfo?.gender) {
      setMainTabs([
        {
          id: 'body',
          name: 'Body',
          icon: avatarAssets._assetsIcons.body?.main || UserIcon,
          subTabs: [userInfo?.gender === 'M' ? 'male' : 'female']
        },
        {
          id: 'hair',
          name: 'Hair',
          icon: avatarAssets._assetsIcons.hair?.main || SparklesIcon,
          subTabs: ['hair', 'hats', 'accessories', 'glasses', 'face']
        },
        {
          id: 'clothing',
          name: 'Tops',
          icon: avatarAssets._assetsIcons.tops?.main || SwatchIcon,
          subTabs: ['shirts', 'chest', 'topAccessories', 'jackets']
        },
        {
          id: 'bottoms',
          name: 'Bottoms',
          icon: avatarAssets._assetsIcons.bottoms?.main || RectangleStackIcon,
          subTabs: ['pants', 'shoes', 'belts']
        }
      ]);
    }
  }, [avatarAssets, userInfo]);

  useEffect(() => {
    if (avatarAssets && workingAvatar) {
      const createSubTabData = (habboCode, imagePath, gender = null) => {
        const setType = avatarAssets.getSetType(habboCode);
        const targetGender = gender || workingAvatar._gender;
        // console.log(`SET TYPE obj for "${habboCode}". dt ->  `, setType);
        // console.log('Palette for set -> ', setType.getPalette());


        return {
          habboCode,
          image: imagePath,
          setType,
          palette: setType?.getPalette(),
          options: setType?.createOptions(targetGender) || [],
          colors: setType?._palette?._colors || {}
        };
      };

      setSubTabs({
        male: {
          name: 'Male',
          ...createSubTabData('hd', avatarAssets._assetsIcons?.body?.subs?.male, 'M'),
          isGender: true,
          gender: 'M'
        },
        female: {
          name: 'Female',
          ...createSubTabData('hd', avatarAssets._assetsIcons?.body?.subs?.female, 'F'),
          isGender: true,
          gender: 'F'
        },
        hair: {
          name: 'Hair',
          ...createSubTabData('hr', avatarAssets._assetsIcons?.hair?.subs?.hair)
        },
        hats: {
          name: 'Hats',
          ...createSubTabData('ha', avatarAssets._assetsIcons?.hair?.subs?.hats)
        },
        accessories: {
          name: 'Hair Accessories',
          ...createSubTabData('he', avatarAssets._assetsIcons?.hair?.subs?.hairAccessories)
        },
        glasses: {
          name: 'Glasses',
          ...createSubTabData('ea', avatarAssets._assetsIcons?.hair?.subs?.glasses)
        },
        face: {
          name: 'Face Accessories',
          ...createSubTabData('fa', avatarAssets._assetsIcons?.hair?.subs?.moustaches)
        },
        shirts: {
          name: 'Shirts',
          ...createSubTabData('ch', avatarAssets._assetsIcons?.tops?.subs?.top)
        },
        chest: {
          name: 'Chest Accessories',
          ...createSubTabData('cp', avatarAssets._assetsIcons?.tops?.subs?.chest)
        },
        jackets: {
          name: 'Jackets',
          ...createSubTabData('cc', avatarAssets._assetsIcons?.tops?.subs?.jackets)
        },
        topAccessories: {
          name: 'Top Accessories',
          ...createSubTabData('ca', avatarAssets._assetsIcons?.tops?.subs?.accessories)
        },
        pants: {
          name: 'Pants',
          ...createSubTabData('lg', avatarAssets._assetsIcons?.bottoms?.subs?.bottomsSn)
        },
        shoes: {
          name: 'Shoes',
          ...createSubTabData('sh', avatarAssets._assetsIcons?.bottoms?.subs?.shoes)
        },
        belts: {
          name: 'Belts',
          ...createSubTabData('wa', avatarAssets._assetsIcons?.bottoms?.subs?.belts)
        }
      });
    }
  }, [avatarAssets, workingAvatar]);

  // Auto-select first subtab when main tab changes
  useEffect(() => {
    if (mainTabs.length > 0) {
      const currentTab = mainTabs.find(tab => tab.id === activeMainTab);
      if (currentTab && currentTab.subTabs.length > 0) {
        setActiveSubTab(currentTab.subTabs[0]);
      }
    }
  }, [activeMainTab, mainTabs, userInfo]);

  const updateAvatarPart = async (habboCode, setId, colorId = '') => {
    if (!workingAvatar || isLoadingAvatar) return;

    // Set loading state
    setIsLoadingAvatar(true);
    setLoadingItemId(setId);

    try {
      if (habboCode === 'gender') {
        // Create new avatar with new gender and rebuild subtabs
        const newAvatar = new HabboAvatar(setId);
        setWorkingAvatar(newAvatar);

        // Wait for avatar image to potentially load
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
      }

      if (workingAvatar._figure[habboCode]) {
        // Create new figure object to trigger re-render
        const tmp = avatarAssets?.getSetType(habboCode).getPalette(setId);
        console.log('Updating colors path !!! -> ', tmp);
        setColorsTest([...tmp]);

        const newFigure = { ...workingAvatar._figure };
        newFigure[habboCode] = { ...newFigure[habboCode], set: setId, color: colorId };
        const newAvatar = new HabboAvatar(workingAvatar._gender, newFigure);
        setWorkingAvatar(newAvatar);

        // Wait for avatar image to potentially load
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } finally {
      // Clear loading state
      setIsLoadingAvatar(false);
      setLoadingItemId(null);
    }
  };

  const updateAvatarColor = async (habboCode, layerIndex, colorId) => {
    if (!workingAvatar || !workingAvatar._figure[habboCode] || isLoadingColor) return;

    // Set loading state for color
    setIsLoadingColor(true);
    setLoadingColorKey(`${layerIndex}-${colorId}`);

    try {
      const currentColorString = workingAvatar._figure[habboCode].color || '';
      const currentColors = currentColorString ? currentColorString.split('-') : [];

      // Update the specific layer
      currentColors[layerIndex] = colorId;

      // Join with dashes, but if only one color, return just that color
      const newColorString = currentColors.length === 1 ? currentColors[0] : currentColors.join('-');

      const newFigure = { ...workingAvatar._figure };
      newFigure[habboCode] = { ...newFigure[habboCode], color: newColorString };
      const newAvatar = new HabboAvatar(workingAvatar._gender, newFigure);
      setWorkingAvatar(newAvatar);

      // Wait for avatar image to potentially load
      await new Promise(resolve => setTimeout(resolve, 200));
    } finally {
      // Clear loading state
      setIsLoadingColor(false);
      setLoadingColorKey(null);
    }
  };

  const getSelectedSetId = (habboCode) => {
    if (!workingAvatar) return '';
    if (habboCode === 'gender') return workingAvatar._gender;
    return workingAvatar._figure[habboCode]?.set || '';
  };

  const getSelectedColorId = (habboCode) => {
    if (!workingAvatar) return '';
    return workingAvatar._figure[habboCode]?.color || '';
  };

  const handleSave = () => {
    if (workingAvatar) {
      console.log('Working avatar data to save -> ', workingAvatar);
      try {
        updateAvatar(workingAvatar);
      } catch (error) {
        console.error('Failed to save avatar. Error(s): ', error);
      }
    }
    onClose();
  };

  const renderAvatarPreview = () => {
    if (!workingAvatar) return null;

    const figureString = workingAvatar.getFigure();
    const imageUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=2&head_direction=2&action=std&gesture=std&gender=${workingAvatar._gender}`;

    return (
      <div className="relative w-32 h-40 sm:w-48 sm:h-64 mx-auto bg-gradient-to-b from-blue-50 to-green-50 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
        {/* Loading overlay for avatar preview */}
        {isLoadingAvatar && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <img
          src={imageUrl}
          alt="Avatar Preview"
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div className="hidden text-center text-gray-500">
          <div className="text-4xl mb-2">👤</div>
          <div className="text-sm">Avatar Preview</div>
          <div className="text-xs mt-1">{figureString}</div>
        </div>
      </div>
    );
  };

  if (!isOpen || !workingAvatar) return null;

  const currentSubTab = subTabs[activeSubTab];
  const currentOptions = currentSubTab?.options || [];
  const currentColors = Object.values(currentSubTab?.colors || {});
  const selectedSetId = getSelectedSetId(currentSubTab?.habboCode || activeSubTab);
  const selectedColorId = getSelectedColorId(currentSubTab?.habboCode || activeSubTab);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 shrink-0">
          <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Avatar Studio
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Mobile/Tablet Navigation */}
          <div className="lg:hidden border-b border-gray-200 bg-gray-50">
            {/* Main Tabs Mobile */}
            <div className="flex overflow-x-auto p-2">
              {mainTabs.map((tab) => {
                const IconComponent = typeof tab.icon === 'string' ? null : tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMainTab(tab.id)}
                    disabled={isLoadingAvatar || isLoadingColor}
                    className={`flex-shrink-0 mx-1 px-4 py-2 rounded-xl transition-all duration-200 ${isLoadingAvatar || isLoadingColor
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                      } ${activeMainTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      {typeof tab.icon === 'string' ? (
                        <img src={tab.icon} alt={tab.name} className="w-4 h-4" />
                      ) : (
                        <IconComponent className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{tab.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sub Tabs Mobile */}
            <div className="flex overflow-x-auto p-2 bg-white">
              {mainTabs.find(tab => tab.id === activeMainTab)?.subTabs.map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => setActiveSubTab(subTab)}
                  disabled={isLoadingAvatar || isLoadingColor}
                  className={`flex-shrink-0 mx-1 px-3 py-2 rounded-xl transition-all duration-200 text-sm ${isLoadingAvatar || isLoadingColor
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                    } ${activeSubTab === subTab
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {subTabs[subTab]?.name}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex">
            {/* Main Navigation Desktop */}
            <div className="w-20 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center py-6 space-y-4">
              {mainTabs.map((tab) => {
                const IconComponent = typeof tab.icon === 'string' ? null : tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMainTab(tab.id)}
                    disabled={isLoadingAvatar || isLoadingColor}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${isLoadingAvatar || isLoadingColor
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                      } ${activeMainTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-110'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      }`}
                    title={tab.name}
                  >
                    {typeof tab.icon === 'string' ? (
                      <img src={tab.icon} alt={tab.name} className="w-6 h-6" />
                    ) : (
                      <IconComponent className="h-6 w-6" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sub Navigation Desktop */}
            <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                {mainTabs.find(tab => tab.id === activeMainTab)?.name}
              </h3>
              <div className="space-y-2">
                {mainTabs.find(tab => tab.id === activeMainTab)?.subTabs.map((subTab) => (
                  <button
                    key={subTab}
                    onClick={() => {
                      if (subTab === 'male' || subTab === 'female') {
                        // (habboCode, setId, colorId = '')
                        if (workingAvatar._gender !== subTab.toUpperCase()[0]) {
                          updateAvatarPart('gender', subTab.toUpperCase()[0]);
                        }
                      }
                      setActiveSubTab(subTab);
                    }}
                    disabled={isLoadingAvatar || isLoadingColor}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 ${isLoadingAvatar || isLoadingColor
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                      } ${activeSubTab === subTab
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                  >
                    {subTabs[subTab]?.image ? (
                      <img
                        src={subTabs[subTab].image}
                        alt={subTabs[subTab].name}
                        className="w-6 h-6 object-contain"
                      />
                    ) : null}
                    <div className="font-medium">{subTabs[subTab]?.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Avatar Preview */}
            <div className="lg:w-80 bg-gradient-to-b from-purple-50 via-blue-50 to-green-50 flex flex-col items-center justify-center relative p-4">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Preview</h3>
                {renderAvatarPreview()}
                <div className="mt-4 text-sm text-gray-500">
                  Gender: {workingAvatar._gender === 'M' ? 'Male' : 'Female'}
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
            </div>

            {/* Customization Options */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50">
              {currentSubTab && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span>{currentSubTab.name}</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                    </h3>

                    {/* Items Grid */}
                    {currentOptions.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                        {currentOptions.map((option) => {
                          const isSelected = currentSubTab.isGender
                            ? selectedSetId === currentSubTab.gender
                            : selectedSetId === option.id;

                          const isLoadingThis = isLoadingAvatar && loadingItemId === option.id;
                          const figureForPreview = `${currentSubTab.habboCode}-${option.id}`;

                          return (
                            <button
                              key={option.id}
                              onClick={() => {
                                updateAvatarPart(currentSubTab.habboCode, option.id);
                              }}
                              disabled={isLoadingAvatar || isLoadingColor}
                              className={`w-full aspect-square rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-1 sm:space-y-2 p-2 relative ${isLoadingAvatar || isLoadingColor
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                                } ${isSelected
                                  ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-blue-100 shadow-lg transform scale-105'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-102'
                                }`}
                            >
                              {/* Loading spinner for individual item */}
                              {isLoadingThis && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                </div>
                              )}

                              <img
                                src={`https://www.habbo.com/habbo-imaging/avatarimage?headonly=${activeMainTab === 'hair' || activeMainTab === 'body' ? '1' : '0'}&direction=2&head_direction=2&gender=${currentSubTab.isGender ? currentSubTab.gender : workingAvatar._gender}&figure=${figureForPreview}`}
                                alt={option.name}
                                className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div className="hidden w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                                {option.id}
                              </div>
                              <span className="text-xs font-medium text-gray-600 text-center px-1 leading-tight">
                                {option.name || option.id}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-lg mb-2">No items available</div>
                        <div className="text-sm">Check back later for more options</div>
                      </div>
                    )}

                    {/* Colors */}
                    {colorsTest?.length > 0 && colorsTest.map((palette, index) => {
                      const currentColorString = workingAvatar?._figure[currentSubTab.habboCode]?.color || '';
                      const currentColors = currentColorString ? currentColorString.split('-') : [];
                      const currentLayerColor = currentColors[index] || '';

                      // Hide layers after first if no base color set
                      if (index > 0 && !currentColors[0]) {
                        return null;
                      }

                      return (
                        <div key={index}>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Colors Layer ({index + 1})</h4>
                          <div className="grid grid-cols-12 sm:grid-cols-16 lg:grid-cols-20 gap-0.5 sm:gap-1">
                            {Object.entries(palette?._colors || {}).map(([colorId, color]) => {
                              const colorKey = `${index}-${colorId}`;
                              const isLoadingThisColor = isLoadingColor && loadingColorKey === colorKey;

                              return (
                                <button
                                  key={colorId}
                                  onClick={() => updateAvatarColor(currentSubTab.habboCode, index, colorId)}
                                  disabled={isLoadingAvatar || isLoadingColor}
                                  className={`aspect-square w-4 h-4 sm:w-5 sm:h-5 rounded border transition-all duration-200 relative ${isLoadingAvatar || isLoadingColor
                                      ? 'opacity-50 cursor-not-allowed'
                                      : ''
                                    } ${currentLayerColor === colorId
                                      ? 'border-gray-800 shadow-md transform scale-125'
                                      : 'border-gray-300 hover:border-gray-400 hover:scale-110'
                                    }`}
                                  style={{ backgroundColor: `#${color?._hex}` }}
                                  title={`Color ${colorId}`}
                                >
                                  {/* Loading spinner for individual color */}
                                  {isLoadingThisColor && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded">
                                      <div className="animate-spin rounded-full h-2 w-2 border border-gray-600 border-b-transparent"></div>
                                    </div>
                                  )}

                                  {currentLayerColor === colorId && (
                                    <div className="absolute inset-0 rounded border border-white"></div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 shrink-0">
          <button
            onClick={onClose}
            disabled={isLoadingAvatar || isLoadingColor}
            className={`px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold transition-all duration-200 text-sm sm:text-base ${isLoadingAvatar || isLoadingColor
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100 hover:border-gray-400'
              }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoadingAvatar || isLoadingColor}
            className={`px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg text-sm sm:text-base ${isLoadingAvatar || isLoadingColor
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:from-blue-700 hover:to-purple-700'
              }`}
          >
            <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Save Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor;