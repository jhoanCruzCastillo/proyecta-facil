<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateConfigTablas extends Migration
{
    public function up()
    {
        // config_tablas — 1:1 con campos (campo_id es PK y FK a la vez, sin surrogate propio).
        // Sin columna_dinamica_id todavía — se agrega por ALTER tras crear columnas_tabla
        // (referencia circular config_tablas <-> columnas_tabla).
        $this->forge->addField([
            'campo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'subtipo' => ['type' => 'ENUM', 'constraint' => ['filas_dinamicas', 'matriz_por_periodos', 'jerarquica']],
            'filas_iniciales' => ['type' => 'SMALLINT', 'unsigned' => true, 'null' => true],
            'max_filas' => ['type' => 'SMALLINT', 'unsigned' => true, 'null' => true],
            'agrupador' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'agrupador_abarca_columnas' => ['type' => 'TINYINT', 'unsigned' => true, 'null' => true],
            'captura_hoja' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'captura_columna_inicial' => ['type' => 'VARCHAR', 'constraint' => 5, 'null' => true],
            'captura_fila_inicial' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'captura_filas_base' => ['type' => 'SMALLINT', 'unsigned' => true, 'null' => true],
        ]);
        $this->forge->addPrimaryKey('campo_id');
        $this->forge->addForeignKey('campo_id', 'campos', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('config_tablas');

        // columnas_tabla
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'config_tabla_campo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            // id de negocio usado por valores_campo.valor_json para referenciar esta columna
            // (las claves del JSON no pueden ser el id autoincremental porque se generan en el
            // editor antes de persistir).
            'columna_id_logico' => ['type' => 'VARCHAR', 'constraint' => 50],
            'nombre' => ['type' => 'VARCHAR', 'constraint' => 150],
            'tipo' => ['type' => 'ENUM', 'constraint' => [
                'texto_corto', 'texto_largo', 'numero', 'decimal', 'fecha', 'booleano',
                'coordenadas', 'calculado', 'catalogo', 'catalogo_encadenado', 'auto_numerico',
            ]],
            'nivel' => ['type' => 'ENUM', 'constraint' => ['padre', 'hijo'], 'null' => true],
            'ancho' => ['type' => 'SMALLINT', 'unsigned' => true, 'null' => true],
            'requerido' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'fuente_catalogo' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'encadena_a_columna_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true],
            'formula' => ['type' => 'TEXT', 'null' => true],
            'columna_excel' => ['type' => 'VARCHAR', 'constraint' => 5, 'null' => true],
            'abarca_columnas_excel' => ['type' => 'TINYINT', 'unsigned' => true, 'null' => true],
            'orden' => ['type' => 'SMALLINT', 'unsigned' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['config_tabla_campo_id', 'columna_id_logico']);
        $this->forge->addForeignKey('config_tabla_campo_id', 'config_tablas', 'campo_id', 'CASCADE', 'CASCADE');
        // Auto-referencia (encadenaA en catálogos encadenados dentro de una tabla)
        $this->forge->addForeignKey('encadena_a_columna_id', 'columnas_tabla', 'id', 'CASCADE', 'SET NULL');
        $this->forge->createTable('columnas_tabla');

        // Ahora sí: qué columna es la dinámica (matriz_por_periodos)
        $this->forge->addColumn('config_tablas', [
            'columna_dinamica_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true, 'after' => 'subtipo'],
        ]);
        $this->forge->addForeignKey('columna_dinamica_id', 'columnas_tabla', 'id', 'CASCADE', 'SET NULL');
        $this->forge->processIndexes('config_tablas');

        // config_tabla_periodos — descompone ConfigTabla.periodos[]
        $this->forge->addField([
            'config_tabla_campo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'orden' => ['type' => 'SMALLINT', 'unsigned' => true],
            'periodo_nombre' => ['type' => 'VARCHAR', 'constraint' => 50],
        ]);
        $this->forge->addPrimaryKey(['config_tabla_campo_id', 'orden']);
        $this->forge->addForeignKey('config_tabla_campo_id', 'config_tablas', 'campo_id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('config_tabla_periodos');

        // cabeceras_grupo
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'config_tabla_campo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'titulo' => ['type' => 'VARCHAR', 'constraint' => 150],
            'orden' => ['type' => 'SMALLINT', 'unsigned' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('config_tabla_campo_id', 'config_tablas', 'campo_id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('cabeceras_grupo');

        // cabecera_grupo_columnas — descompone CabeceraGrupo.hijoIds[] (N:M)
        $this->forge->addField([
            'cabecera_grupo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'columna_tabla_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
        ]);
        $this->forge->addPrimaryKey(['cabecera_grupo_id', 'columna_tabla_id']);
        $this->forge->addForeignKey('cabecera_grupo_id', 'cabeceras_grupo', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('columna_tabla_id', 'columnas_tabla', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('cabecera_grupo_columnas');
    }

    public function down()
    {
        $this->forge->dropTable('cabecera_grupo_columnas');
        $this->forge->dropTable('cabeceras_grupo');
        $this->forge->dropTable('config_tabla_periodos');
        $this->forge->dropForeignKey('config_tablas', 'config_tablas_columna_dinamica_id_foreign');
        $this->forge->dropColumn('config_tablas', 'columna_dinamica_id');
        $this->forge->dropTable('columnas_tabla');
        $this->forge->dropTable('config_tablas');
    }
}
