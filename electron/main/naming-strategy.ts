import camelcase from 'camelcase';
import { DefaultNamingStrategy, Table } from 'typeorm';
import { RandomGenerator } from 'typeorm/util/RandomGenerator';

export class NamingStrategy extends DefaultNamingStrategy {
  override joinColumnName(relationName: string, referencedColumnName: string): string {
    return super.joinColumnName(referencedColumnName, relationName);
  }

  override foreignKeyName(tableOrName: Table | string, columnNames: string[], referencedTablePath: string): string {
    const clonedColumnNames = [...columnNames].sort();
    const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const replacedTableName = tableName.replace('.', '_');
    const replacedReferenceTablePath = referencedTablePath.replace('.', '_');
    const key = `${replacedTableName}_${replacedReferenceTablePath}_${clonedColumnNames.join('_')}`;
    return 'FK_' + RandomGenerator.sha1(key).substr(0, 27);
  }

  override tableName(targetName: string, userSpecifiedName: string | undefined): string {
    targetName = targetName.replace(/Entity$/, '');
    return super.tableName(targetName, userSpecifiedName);
  }

  override joinTableName(firstTableName: string, secondTableName: string): string {
    return `${firstTableName}_${secondTableName}`;
  }

  override joinTableColumnName(tableName: string, propertyName: string): string {
    return camelcase(`${propertyName}_${tableName}`);
  }

  override joinTableInverseColumnName(tableName: string, propertyName: string): string {
    return camelcase(`${propertyName}_${tableName}`);
  }
}
