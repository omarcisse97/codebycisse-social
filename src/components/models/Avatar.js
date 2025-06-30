export class HabboAvatar {
    constructor(gender = 'M', figure = null) {
        this._gender = gender;
        this._figure = !figure ? {
            hr: { color: '', set: '' },
            hd: { color: '', set: `${gender === 'F'? '600' : '180'}` },
            ch: { color: '', set: '' },
            lg: { color: '', set: '' },
            sh: { color: '', set: '' },
            ha: { color: '', set: '' },
            he: { color: '', set: '' },
            ea: { color: '', set: '' },
            fa: { color: '', set: '' },
            ca: { color: '', set: '' },
            wa: { color: '', set: '' },
            cc: { color: '', set: '' },
            cp: { color: '', set: '' }
        } : { ...figure }
    }

    getFullBodyImage(headDirection = '2', direction = '2'){
       let figure = this.getFigure();
        let gender = `&gender=${this._gender}`;
        if(figure !== ''){
            figure = `&figure=${figure}`;
        }
        return `https://www.habbo.com/habbo-imaging/avatarimage?size=l&direction=${direction}&head_direction=${headDirection}${gender}${figure}`; 
    }
    getHeadOnlyImage(headDirection = '2', direction = '2'){
        let figure = this.getFigure();
        let gender = `&gender=${this._gender}`;
        if(figure !== ''){
            figure = `&figure=${figure}`;
        }
        return `https://www.habbo.com/habbo-imaging/avatarimage?headonly=1&direction=${direction}&head_direction=${headDirection}${gender}${figure}`;
    }
    setFigureFromString(figureString) {
        try {
            if (!figureString || typeof figureString !== 'string') {
                throw new Error('Invalid figure string provided');
            }

            // Reset figure to empty state
            this._figure = {
                hr: { color: '', set: '' },
                hd: { color: '', set: '' },
                ch: { color: '', set: '' },
                lg: { color: '', set: '' },
                sh: { color: '', set: '' },
                ha: { color: '', set: '' },
                he: { color: '', set: '' },
                ea: { color: '', set: '' },
                fa: { color: '', set: '' },
                ca: { color: '', set: '' },
                wa: { color: '', set: '' },
                cc: { color: '', set: '' },
                cp: { color: '', set: '' }
            };

            // Split figure string by dots
            const parts = figureString.split('.');
            
            for (const part of parts) {
                if (!part) continue;
                
                // Split each part by dashes
                const segments = part.split('-');
                
                if (segments.length < 2) {
                    console.warn(`Invalid figure part: ${part}`);
                    continue;
                }
                
                const type = segments[0];
                const set = segments[1];
                const color = segments[2] || '';
                
                // Only update if the type exists in our figure structure
                if (Object.prototype.hasOwnProperty.call(this._figure, type)) {
                    this._figure[type] = {
                        set: set,
                        color: color
                    };
                }
            }
            
            return this;
        } catch (error) {
            console.error('Failed to restore figure from string. Error(s): ', error);
            return this;
        }
    }

    // Static method to create avatar from figure string
    static fromFigureString(figureString, gender = 'M') {
        const avatar = new HabboAvatar(gender);
        avatar.setFigureFromString(figureString);
        return avatar;
    }

    getJSON() {
        return JSON.stringify({
            gender: this._gender,
            figure: this._figure
        });
    }

    getFigure() {
        try {
            if (!this._gender || !this._figure) {
                throw new Error('Habbo avatar does not have a figure or gender');
            }
            let figure = '';
            for (const type in this._figure) {
                if (this._figure[type].set === '') {
                    continue;
                }
                
                figure = `${figure}${figure.length > 0? '.': ''}${type}-${this._figure[type].set}`;
                figure = `${figure}${this._figure[type].color !== '' ? `-${this._figure[type].color}` : ''}`;
            }
                        
            return figure;
        } catch (error) {
            console.error('Failed to get avatar figure. Error(s): ', error);
            return '';
        }
    }
}