import Body from './body.png';
import Male from './male.png';
import Female from './female.png';
import Hair from './hair.png';
import HairSn from './hair-sn.png';
import Hats from './hats.png';
import HairAccessories from './hair-accessories.png';
import Glasses from './glasses.png';
import Moustaches from './moustaches.png';
import Tops from './tops.png';
import Top from './top.png';
import Chest from './chest.png';
import Jackets from './jackets.png';
import Accessories from './accessories.png';
import Bottoms from './bottoms.png';
import BottomsSn from './bottoms-sn.png';
import Shoes from './shoes.png';
import Belts from './belts.png';

export const habboWardrobeIcons = () => {
    return {
        body: {
            main: Body,
            subs: {
                male: Male,
                female: Female
            }
        },
        hair: {
            main: Hair,
            subs: {
                hair: HairSn,
                hats: Hats,
                hairAccessories: HairAccessories,
                glasses: Glasses,
                moustaches: Moustaches
            }
        },
        tops: {
            main: Tops,
            subs: {
                top: Top,
                chest: Chest,
                jackets: Jackets,
                accessories: Accessories
            }
        },
        bottoms: {
            main: Bottoms,
            subs: {
                bottomsSn: BottomsSn,
                shoes: Shoes,
                belts: Belts
            }
        }
    }
}