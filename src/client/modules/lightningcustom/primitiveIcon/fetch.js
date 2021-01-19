// eslint-disable-next-line @lwc/lwc/no-async-await
export async function fetchIconLibrary(dir, category) {
    if (dir === 'rtl') {
        switch (category) {
            case 'utility': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesUtilityRtl'
                );
                return Lib;
            }
            case 'action': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesActionRtl'
                );
                return Lib;
            }
            case 'standard': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesStandardRtl'
                );
                return Lib;
            }
            case 'doctype': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesDoctypeRtl'
                );
                return Lib;
            }
            case 'custom': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesCustomRtl'
                );
                return Lib;
            }
            default:
                return null;
        }
    } else {
        switch (category) {
            case 'utility': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesUtility'
                );
                return Lib;
            }
            case 'action': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesAction'
                );
                return Lib;
            }
            case 'standard': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesStandard'
                );
                return Lib;
            }
            case 'doctype': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesDoctype'
                );
                return Lib;
            }
            case 'custom': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesCustom'
                );
                return Lib;
            }
            default:
                return null;
        }
    }
}
