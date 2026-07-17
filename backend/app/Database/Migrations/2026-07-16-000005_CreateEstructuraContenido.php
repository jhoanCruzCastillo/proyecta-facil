<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateEstructuraContenido extends Migration
{
    public function up()
    {
        // secciones
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'plantilla_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'numero' => ['type' => 'VARCHAR', 'constraint' => 10],
            'nombre' => ['type' => 'VARCHAR', 'constraint' => 200],
            'hoja' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'orden' => ['type' => 'SMALLINT', 'unsigned' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['plantilla_id', 'numero']);
        $this->forge->addForeignKey('plantilla_id', 'plantillas', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('secciones');

        // subsecciones
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'seccion_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'codigo' => ['type' => 'VARCHAR', 'constraint' => 20],
            'nombre' => ['type' => 'VARCHAR', 'constraint' => 200],
            'ayuda' => ['type' => 'TEXT', 'null' => true],
            'orden' => ['type' => 'SMALLINT', 'unsigned' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['seccion_id', 'codigo']);
        $this->forge->addForeignKey('seccion_id', 'secciones', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('subsecciones');

        // campos
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'subseccion_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'identificador' => ['type' => 'VARCHAR', 'constraint' => 30],
            'etiqueta' => ['type' => 'VARCHAR', 'constraint' => 200],
            'tipo' => ['type' => 'ENUM', 'constraint' => [
                'texto_corto', 'texto_largo', 'numero', 'fecha', 'decimal', 'booleano',
                'catalogo_simple', 'catalogo_encadenado', 'seleccion', 'tabla', 'tabla_jerarquica',
                'calculado', 'imagen', 'firma', 'mapa_coordenadas',
            ]],
            'editable' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'requerido' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'descripcion' => ['type' => 'TEXT', 'null' => true],
            'fuente_catalogo' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'valor_ejemplo' => ['type' => 'TEXT', 'null' => true],
            'captura_columna' => ['type' => 'VARCHAR', 'constraint' => 5, 'null' => true],
            'captura_fila' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'captura_abarca_columnas' => ['type' => 'TINYINT', 'unsigned' => true, 'null' => true],
            'captura_abarca_filas' => ['type' => 'TINYINT', 'unsigned' => true, 'null' => true],
            // Cajón de propiedades ad-hoc sin forma fija (Campo.config en el prototipo) — ver
            // "excepción deliberada #2" en docs/database-design.md.
            'config_json' => ['type' => 'JSON', 'null' => true],
            'orden' => ['type' => 'SMALLINT', 'unsigned' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['subseccion_id', 'identificador']);
        $this->forge->addForeignKey('subseccion_id', 'subsecciones', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('campos');

        // campo_cadena_pasos — descompone Campo.cadena[] (solo tipo='catalogo_encadenado')
        $this->forge->addField([
            'campo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'orden' => ['type' => 'TINYINT', 'unsigned' => true],
            'paso' => ['type' => 'VARCHAR', 'constraint' => 100],
        ]);
        $this->forge->addPrimaryKey(['campo_id', 'orden']);
        $this->forge->addForeignKey('campo_id', 'campos', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('campo_cadena_pasos');
    }

    public function down()
    {
        $this->forge->dropTable('campo_cadena_pasos');
        $this->forge->dropTable('campos');
        $this->forge->dropTable('subsecciones');
        $this->forge->dropTable('secciones');
    }
}
