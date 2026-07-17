<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreatePlantillasTable extends Migration
{
    public function up()
    {
        // plantillas: sin asignado_archivo_id todavía — se agrega por ALTER al final de este archivo,
        // una vez que archivos_excel ya existe (referencia circular plantillas <-> archivos_excel).
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'sector_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'codigo' => ['type' => 'VARCHAR', 'constraint' => 30],
            'nombre' => ['type' => 'VARCHAR', 'constraint' => 200],
            'descripcion' => ['type' => 'TEXT'],
            'instrumento' => ['type' => 'ENUM', 'constraint' => ['formato', 'ioarr', 'ficha_tecnica', 'perfil']],
            'fecha_actualizacion' => ['type' => 'DATE'],
            'archivo_default_url' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'disponible_nivel0' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('codigo');
        $this->forge->addForeignKey('sector_id', 'sectores', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('plantillas');

        // plantilla_tipologia_ioarr — descompone Plantilla.tipologiasIoarr[] (1FN)
        $this->forge->addField([
            'plantilla_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'tipologia' => ['type' => 'ENUM', 'constraint' => ['optimizacion', 'ampliacion_marginal', 'reposicion', 'rehabilitacion']],
        ]);
        $this->forge->addPrimaryKey(['plantilla_id', 'tipologia']);
        $this->forge->addForeignKey('plantilla_id', 'plantillas', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('plantilla_tipologia_ioarr');

        // archivos_excel — catálogo de archivos (Cloudinary) por plantilla
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'plantilla_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'nombre' => ['type' => 'VARCHAR', 'constraint' => 200],
            'url' => ['type' => 'VARCHAR', 'constraint' => 500],
            'fecha_subida' => ['type' => 'DATETIME'],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('plantilla_id', 'plantillas', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('archivos_excel');

        // Ahora sí: qué archivo está activo para cada plantilla (puntero 1:1 hacia archivos_excel)
        $this->forge->addColumn('plantillas', [
            'asignado_archivo_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true, 'after' => 'archivo_default_url'],
        ]);
        $this->forge->addForeignKey('asignado_archivo_id', 'archivos_excel', 'id', 'CASCADE', 'SET NULL');
        $this->forge->processIndexes('plantillas');
    }

    public function down()
    {
        $this->forge->dropForeignKey('plantillas', 'plantillas_asignado_archivo_id_foreign');
        $this->forge->dropTable('archivos_excel');
        $this->forge->dropTable('plantilla_tipologia_ioarr');
        $this->forge->dropTable('plantillas');
    }
}
