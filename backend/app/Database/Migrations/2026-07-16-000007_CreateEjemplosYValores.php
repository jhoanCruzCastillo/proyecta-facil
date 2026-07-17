<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateEjemplosYValores extends Migration
{
    public function up()
    {
        // ejemplos
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'plantilla_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'nombre' => ['type' => 'VARCHAR', 'constraint' => 200],
            'subtitulo' => ['type' => 'VARCHAR', 'constraint' => 200, 'null' => true],
            'detalle' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'activo' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            // NULL = ejemplo de referencia autorado por el admin. No-NULL = ficha de un cliente
            // (usuarioId de la cuenta titular, ver cuentaEfectivaDe en el prototipo).
            'propietario_usuario_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true],
            'creado_por_usuario_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true],
            'compartida' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('plantilla_id', 'plantillas', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('propietario_usuario_id', 'usuarios', 'id', 'CASCADE', 'SET NULL');
        $this->forge->addForeignKey('creado_por_usuario_id', 'usuarios', 'id', 'CASCADE', 'SET NULL');
        $this->forge->createTable('ejemplos');

        // ejemplo_tipologia_ioarr — descompone Ejemplo.tipologiasIoarr[]
        $this->forge->addField([
            'ejemplo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'tipologia' => ['type' => 'ENUM', 'constraint' => ['optimizacion', 'ampliacion_marginal', 'reposicion', 'rehabilitacion']],
        ]);
        $this->forge->addPrimaryKey(['ejemplo_id', 'tipologia']);
        $this->forge->addForeignKey('ejemplo_id', 'ejemplos', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('ejemplo_tipologia_ioarr');

        // valores_campo — reemplaza a Ejemplo.valores: Record<identificador, valor>. Una fila por
        // (ejemplo, campo); valor_texto para tipos simples, valor_json para tabla/tabla_jerarquica
        // (ver "excepción deliberada #1" en docs/database-design.md).
        $this->forge->addField([
            'ejemplo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'campo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'valor_texto' => ['type' => 'TEXT', 'null' => true],
            'valor_json' => ['type' => 'JSON', 'null' => true],
        ]);
        $this->forge->addPrimaryKey(['ejemplo_id', 'campo_id']);
        $this->forge->addForeignKey('ejemplo_id', 'ejemplos', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('campo_id', 'campos', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('valores_campo');

        // archivos_excel_ejemplo — snapshot 1:1 del Excel tomado al crear la ficha
        $this->forge->addField([
            'ejemplo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'nombre' => ['type' => 'VARCHAR', 'constraint' => 200],
            'url' => ['type' => 'VARCHAR', 'constraint' => 500],
            'fecha_subida' => ['type' => 'DATETIME'],
        ]);
        $this->forge->addPrimaryKey('ejemplo_id');
        $this->forge->addForeignKey('ejemplo_id', 'ejemplos', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('archivos_excel_ejemplo');
    }

    public function down()
    {
        $this->forge->dropTable('archivos_excel_ejemplo');
        $this->forge->dropTable('valores_campo');
        $this->forge->dropTable('ejemplo_tipologia_ioarr');
        $this->forge->dropTable('ejemplos');
    }
}
