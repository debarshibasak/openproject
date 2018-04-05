import {Component, Injector} from '@angular/core';
import {I18nToken} from 'core-app/angular4-transition-utils';
import {QueryColumn} from 'core-components/wp-query/query-column';
import {ConfigurationService} from 'core-components/common/config/configuration.service';
import {WorkPackageTableColumnsService} from 'core-components/wp-fast-table/state/wp-table-columns.service';

@Component({
  template: require('!!raw-loader!./columns-tab.component.html')
})
export class WpTableConfigurationColumnsTab {

  readonly I18n = this.injector.get(I18nToken);
  readonly wpTableColumns = this.injector.get(WorkPackageTableColumnsService);
  readonly ConfigurationService = this.injector.get(ConfigurationService);

  public availableColumns = this.wpTableColumns.all;
  public unusedColumns = this.wpTableColumns.unused;
  public selectedColumns = angular.copy(this.wpTableColumns.getColumns());

  public impaired = this.ConfigurationService.accessibilityModeEnabled();
  public selectedColumnMap:{ [id:string]:boolean } = {};
  public eeShowBanners:boolean = false;
  public text = {

    columnsLabel: this.I18n.t('js.label_columns'),
    selectedColumns: this.I18n.t('js.description_selected_columns'),
    multiSelectLabel: this.I18n.t('js.work_packages.label_column_multiselect'),

    upsaleRelationColumns: this.I18n.t('js.modals.upsale_relation_columns'),
    upsaleRelationColumnsLink: this.I18n.t('js.modals.upsale_relation_columns_link')
  };

  constructor(readonly injector:Injector) {

  }

  public setSelectedColumn(column:QueryColumn) {
    if (this.selectedColumnMap[column.id]) {
      this.selectedColumns.push(column);
    }
    else {
      _.remove(this.selectedColumns, (c:QueryColumn) => c.id === column.id);
    }
  }

  ngOnInit() {
    this.eeShowBanners = angular.element('body').hasClass('ee-banners-visible');
    this.selectedColumns.forEach((column:QueryColumn) => {
      this.selectedColumnMap[column.id] = true;
    });
  }
}
