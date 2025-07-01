import { habboAssets } from "../../util/avatarAssets";

export class HabboAvatarColor {
    constructor(id, index, club, selectable, hex) {
        this._id = id;
        this._index = index;
        this._club = club;
        this._selectable = selectable;
        this._hex = hex;

    }

}
export class HabboAvatarPalette {
    constructor(id) {
        this._id = id;
        this._colors = {};
    }
    addColor(id, index, club, selectable, hex) {
        this._colors[id] = new HabboAvatarColor(id, index, club, selectable, hex);
    }
}
export class HabboAvatarPart {
    constructor(id, type, colorable, index, colorindex) {
        this._id = id;
        this._type = type;
        this._colorable = colorable;
        this._index = index;
        this._colorindex = colorindex;
    }

}
export class HabboAvatarSet {
    constructor(id, gender, club, colorable, preselectable, selectable) {
        this._id = id;
        this._gender = gender;
        this._club = club;
        this._colorable = colorable;
        this._preselectable = preselectable;
        this._selectable = selectable;
        this._parts = {};
        this._maxColorIndex = this._colorable;
        this._selectedColorPerPart = [];

    }

    addPart(id, type, colorable, index, colorindex) {
        this._parts[id] = new HabboAvatarPart(id, type, colorable, index, colorindex);
        if (Object.keys(this._parts).length > 1) {
            if (colorable === 1 && colorindex > this._maxColorIndex) {
                this._maxColorIndex = colorindex;
            }
        }
    }
    colorPart(color, index = 1) {
        try {
            if (!color || !index) {
                throw new Error('Empty color or index');
            }
            if (index > this._maxColorIndex) {
                throw new Error(`Set does not have more then ${this._maxColorIndex} palettes. Index must be less than that `);
            }
            this._selectedColorPerPart[index - 1] = color;
        } catch (error) {
            console.error('Failed to color for set. Error(s): ', error);
        }
    }
    preview() {
        try {
            if (!this._id) {
                throw new Error('Set id is not set');
            }
            if (this._selectedColorPerPart.length < 1) {
                return this._id;
            }
            let retVal = `${this._id}`;
            for (let i = 0; i < this._selectedColorPerPart.length; i++) {
                retVal = `${retVal}-${this._selectedColorPerPart._id}`;
            }
            return retVal;
        } catch (error) {
            console.error('Failed to obtain set preview. Error(s): ', error);
        }
    }



}
export class HabboAvatarSetType {
    constructor(type, paletteid, mand_m_0, mand_m_1, mand_f_0, mand_f_1) {
        this._type = type;
        this._paletteid = paletteid;
        this._mand_m_0 = mand_m_0;
        this._mand_m_1 = mand_m_1;
        this._mand_f_0 = mand_f_0;
        this._mand_f_1 = mand_f_1;
        this._sets = {};
        this._palette = null;

    }

    addSet(id, gender, club, colorable, preselectable, selectable) {
        this._sets[id] = new HabboAvatarSet(id, gender, club, colorable, preselectable, selectable);
    }
    fetchPalette(palettesData) {
        try {
            if (!this._paletteid) {
                throw new Error('Palette id not set up');
            }

            if (!palettesData || !palettesData[this._paletteid]) {
                throw new Error('Unable to get palettes data from habbo avatar assets');
            }
            this._palette = palettesData[this._paletteid];
        } catch (error) {
            console.error('Failed to fetch palette. Error(s): ', error);
        }
    }
    getPalette(setId = null) {
        try {
            if (!this._palette || !this._sets) {
                throw new Error('Palettes or sets not initialized');
            }
            if (setId && !this._sets[setId]) {
                throw new Error('setId does not exist in set');
            }

            if (!setId) {
                const retVal = {};
                for (const id in this._sets) {
                    if (this._sets[id]._maxColorIndex < 1) {
                        continue;
                    }
                    retVal[id] = [];
                    for (let i = 0; i < this._sets[id]._maxColorIndex; i++) {
                        retVal[id].push(this._palette);
                    }
                }
                return retVal;
            }
            const retVal = [];
            for (let i = 0; i < this._sets[setId]._maxColorIndex; i++) {
                retVal.push(this._palette);
            }
            return retVal;
        } catch (error) {
            console.error('Failed to obtain palettes. Error(s): ', error);
            return null;
        }
    }
    //{ id: 'tmp', name: 'tmp', preview: '👨' }
    createOptions(gender = 'M') {
        try {
            if (!this._palette || !this._sets) {
                throw new Error('Palettes or sets not initialized');
            }
            if (gender.toUpperCase() !== 'M' && gender.toUpperCase() !== 'F') {
                throw new Error(`Unknown gender "gender"`);
            }
            const retVal = [];
            for (const id in this._sets) {
                if (gender !== this._sets[id]._gender && this._sets[id]._gender !== 'U') {
                    console.log(`Ignoring gender "${this._sets[id]._gender}" since we're working with ${gender}`)
                    continue;
                }
                const temp = { id: id, name: id, preview: this._sets[id].preview() };
                retVal.push({ ...temp });
            }
            return retVal;

        } catch (error) {
            console.error('Failed to create options. Error(s): ', error);
            return null;
        }
    }

}
export class HabboAvatarAssets {
    constructor(gender = 'M') {
        this._storageJSON = habboAssets() || null;
        this._palettes = {};
        this._setTypes = {};
        this._assetsIcons = {};
        this._gender = gender;
    }


    init() {
        try {

            if (!this._storageJSON || !this._storageJSON?.sets || !this._storageJSON?.sets?.figuredata || !this._storageJSON?.icons) {
                throw new Error('Failed to load JSON assets');
            }
            if (!this._storageJSON?.sets?.figuredata?.colors || !this._storageJSON?.sets?.figuredata?.colors?.palette) {
                throw new Error('Cannot find "colors" in JSON data');
            }
            this._assetsIcons = { ...this._storageJSON?.icons }
            //load colors
            this._storageJSON?.sets?.figuredata?.colors?.palette?.map((palette) => {
                const temp = new HabboAvatarPalette(palette?.['@_id']);
                palette?.color?.map((color) => {
                    temp?.addColor(
                        color?.['@_id'],
                        color?.['@_index'],
                        color?.['@_club'],
                        color?.['@_selectable'],
                        color?.['#text']
                    );
                });
                this._palettes[palette?.['@_id']] = temp;
            });

            if (!this._storageJSON?.sets?.figuredata?.sets || !this._storageJSON?.sets?.figuredata?.sets?.settype) {
                throw new Error('Cannot find "sets" in JSON data');
            }
            this._storageJSON?.sets?.figuredata?.sets?.settype?.map((setType) => {
                const temp = new HabboAvatarSetType(
                    setType['@_type'],
                    setType['@_paletteid'],
                    setType['@_mand_m_0'],
                    setType['@_mand_m_1'],
                    setType['@_mand_f_0'],
                    setType['@_mand_f_1']
                );
                
                setType?.set?.map((set) => {
                    if (set['@_gender']?.toLowerCase() === this._gender?.toLowerCase() || set['@_gender']?.toLowerCase() === 'u' ) {
                        temp?.addSet(
                        set['@_id'],
                        set['@_gender'],
                        set['@_club'],
                        set['@_colorable'],
                        set['@_preselectable'],
                        set['@_selectable']
                    );
                    if (Array.isArray(set?.part)) {
                        set?.part?.map((part) => {
                            temp?._sets[set['@_id']]?.addPart(
                                part['@_id'],
                                part['@_type'],
                                part['@_colorable'],
                                part['@_index'],
                                part['@_colorindex']
                            );
                        });
                    } else if (typeof set?.part === 'object' && set?.part !== null) {
                        const part = { ...set?.part };
                        temp?._sets[set['@_id']]?.addPart(
                            part['@_id'],
                            part['@_type'],
                            part['@_colorable'],
                            part['@_index'],
                            part['@_colorindex']
                        );
                    }
                    }

                });
                this._setTypes[setType['@_type']] = temp;
            });

        } catch (error) {
            console.error('HabboAvatarAssets failed. Error(s): ', error);
        }
    }
    initPalettes() {
        try {
            if (!this._palettes || !this._setTypes) {
                throw new Error('Sets and/or Palettes are not initialized');
            }
            for (const setTypeID in this._setTypes) {
                this._setTypes[setTypeID]?.fetchPalette(this._palettes);
            }
        } catch (error) {
            console.error('Failed to initialize Palettes. Error(s): ', error);
        }
    }
    getSetType(type) {
        try {
            if (!this._setTypes || !this._setTypes[type]) {
                throw new Error('Set type not initialized or exist');
            }
            return this._setTypes[type];
        } catch (error) {
            console.error(`Failed to obtain set type "${type}". Error(s): ${error?.message}`);
        }
    }
}
