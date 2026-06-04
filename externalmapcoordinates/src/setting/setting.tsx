import { React } from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import {
    SettingSection,
    SettingRow,
    MapWidgetSelector
} from "jimu-ui/advanced/setting-components";
import { Switch, TextInput, Label } from "jimu-ui";
import { IMConfig } from "../config";

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, {}> {

    onMapWidgetSelected = (useMapWidgetIds: string[]) => {
        this.props.onSettingChange({
            id: this.props.id,
            useMapWidgetIds
        });
    };

    onToggleProperty = (propertyName: keyof IMConfig, value: boolean) => {
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

    renderToggle = (label: string, propName: keyof IMConfig, checkedDefault = false) => {
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
        const { config } = this.props;

        return (
            <div className="widget-setting-external-map-coordinates">

                <SettingSection
                    className="map-selector-section"
                    title="Select Map Widget"
                >
                    <SettingRow>
                        <MapWidgetSelector
                            onSelect={this.onMapWidgetSelected}
                            useMapWidgetIds={this.props.useMapWidgetIds}
                        />
                    </SettingRow>
                </SettingSection>

                <SettingSection title="Settings">
                    {this.renderToggle('Show Zoom', 'showZoom')}
                    {this.renderToggle('Show Scale', 'showScale')}
                </SettingSection>

                <SettingSection title="Pictometry Configuration">
                    <SettingRow>
                        <div style={{ width: '100%' }}>
                            <Label style={{ display: 'block', marginBottom: '4px' }}>
                                Pictometry Base URL
                            </Label>
                            <div style={{ fontSize: '12px', color: '#6a6c6e', marginBottom: '8px', wordBreak: 'break-all' }}>
                                Enter the full URL including .aspx file
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

                <SettingSection title="Button Visibility">
                    {this.renderToggle('Show Pictometry Button', 'showPictometry', true)}
                    {this.renderToggle('Show Google Street View Button', 'showGoogleStreetView', true)}
                    {this.renderToggle('Show Google Maps 3D Button', 'showGoogleMaps3D', true)}
                    {this.renderToggle('Show Bing Satellite Button', 'showBingSatellite', true)}
                    {this.renderToggle('Show Bing Streetside Button', 'showBingStreetside', true)}
                    {this.renderToggle('Show Copy Coordinates Button', 'showCopyButton', true)}
                </SettingSection>
            </div>
        );
    }
}
