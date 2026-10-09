import { React } from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import {
    SettingSection,
    SettingRow,
    MapWidgetSelector
} from "jimu-ui/advanced/setting-components";
import { Switch, TextInput, Label } from "jimu-ui";
import type { Config, IMConfig } from "../config";
import __i18nDefaults from './translations/default'
import { __setIntl } from './i18n-t'
let __i18nIntl: any = null
/** Module translator: app language via the widget intl, English from default.ts, {name} values filled. */
const __t = (id: string, values?: { [key: string]: any }): string => {
  const msg: string = (__i18nDefaults as any)[id] ?? id
  if (__i18nIntl && typeof __i18nIntl.formatMessage === 'function') {
    try { return __i18nIntl.formatMessage({ id, defaultMessage: msg }, values) } catch (e) { }
  }
  return msg.replace(/\{(\w+)\}/g, (m: string, k: string) => (values && values[k] != null ? String(values[k]) : m))
}


type SettingProps = AllWidgetSettingProps<IMConfig> & {
    id: string;
    useMapWidgetIds?: string[] | any;
};

type BooleanConfigKey = {
    [K in keyof Config]: Config[K] extends boolean ? K : never;
}[keyof Config];

class Setting extends React.PureComponent<SettingProps, Record<string, never>> {
    onMapWidgetSelected = (useMapWidgetIds: string[]) => {
        this.props.onSettingChange({
            id: this.props.id,
            useMapWidgetIds
        });
    };

    onToggleProperty = (propertyName: BooleanConfigKey, value: boolean) => {
        this.props.onSettingChange({
            id: this.props.id,
            config: this.props.config.set(propertyName, value)
        });
    };

    onPictometryUrlChange = (evt: any) => {
        const value = evt.currentTarget.value;
        this.props.onSettingChange({
            id: this.props.id,
            config: this.props.config.set('pictometryBaseUrl', value)
        });
    };

    renderToggle = (label: string, propName: BooleanConfigKey, checkedDefault = false) => {
        const checked = this.props.config[propName] !== false && (this.props.config[propName] !== undefined ? this.props.config[propName] : checkedDefault);
        return (
            <SettingRow>
                <div className="w-100 d-flex justify-content-between align-items-center">
                    <Label>{label}</Label>
                    <Switch
                        checked={!!checked}
                        onChange={(evt) => {
                            this.onToggleProperty(propName, evt.target.checked);
                        }}
                    />
                </div>
            </SettingRow>
        );
    };

    render() {
    __setIntl((this.props as any).intl)
    __i18nIntl = (this.props as any).intl
        const { config } = this.props;

        return (
            <div className="widget-setting-external-map-coordinates">

                <SettingSection
                    className="map-selector-section"
                    title={__t("selectMapWidget")}
                >
                    <SettingRow>
                        <MapWidgetSelector
                            onSelect={this.onMapWidgetSelected}
                            useMapWidgetIds={this.props.useMapWidgetIds}
                        />
                    </SettingRow>
                </SettingSection>

                <SettingSection title={__t("settings")}>
                    {this.renderToggle(__t("showZoom"), 'showZoom')}
                    {this.renderToggle(__t("showScale"), 'showScale')}
                </SettingSection>

                <SettingSection title={__t("uiPictometryConfiguration")}>
                    <SettingRow>
                        <div style={{ width: '100%' }}>
                            <Label style={{ display: 'block', marginBottom: '4px' }}>
                                {__t("uiPictometryBaseUrl")}
                            </Label>
                            <div style={{ fontSize: '12px', color: '#6a6c6e', marginBottom: '8px', wordBreak: 'break-all' }}>
                                {__t("uiEnterTheFullUrlIncludingAspx")}
                            </div>
                            <TextInput
                                className="w-100"
                                value={config.pictometryBaseUrl || ''}
                                placeholder="https://www.your-server.com/pictometry/viewer.aspx"
                                onChange={this.onPictometryUrlChange}
                            />
                        </div>
                    </SettingRow>
                </SettingSection>

                <SettingSection title={__t("uiButtonVisibility")}>
                    {this.renderToggle(__t("showPictometryButton"), 'showPictometry', true)}
                    {this.renderToggle(__t("showGoogleStreetViewButton"), 'showGoogleStreetView', true)}
                    {this.renderToggle(__t("showGoogleMaps3dButton"), 'showGoogleMaps3D', true)}
                    {this.renderToggle(__t("showBingSatelliteButton"), 'showBingSatellite', true)}
                    {this.renderToggle(__t("showBingStreetsideButton"), 'showBingStreetside', true)}
                    {this.renderToggle(__t("showCopyCoordinatesButton"), 'showCopyButton', true)}
                </SettingSection>
                <SettingSection title={__t("uiHelp")}>
                  <SettingRow tag='label' label={__t("uiShowHelpGuide")}>
                    <Switch
                      checked={this.props.config?.showHelp !== false}
                      onChange={(evt) => { this.props.onSettingChange({ id: this.props.id, config: (this.props.config as any).set('showHelp', evt.target.checked) }) }}
                      aria-label={__t("uiShowTheQuestionMarkButtonThat")}
                    />
                  </SettingRow>
                </SettingSection>
            </div>
        );
    }
}

// Type-only Visual Studio fallback; class/interface merging emits no JavaScript.
interface Setting {
    readonly props: Readonly<SettingProps>
}

export default Setting
