<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateSectoresTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'codigo' => ['type' => 'VARCHAR', 'constraint' => 20],
            'nombre' => ['type' => 'VARCHAR', 'constraint' => 150],
            'icono' => ['type' => 'VARCHAR', 'constraint' => 50],
            'color_accent' => ['type' => 'VARCHAR', 'constraint' => 20],
            'descripcion' => ['type' => 'TEXT', 'null' => true],
            'tipo_sector' => ['type' => 'ENUM', 'constraint' => ['Sectorial', 'General']],
            'activo' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('codigo');
        $this->forge->createTable('sectores');
    }

    public function down()
    {
        $this->forge->dropTable('sectores');
    }
}
