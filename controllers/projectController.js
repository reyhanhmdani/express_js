import db from "../config/db.js"; // function declaration
export async function getProjects(req, res) {
  try {
    const query = `
      SELECT 
        p.*, 
        COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tech 
      FROM projects p 
      LEFT JOIN project_tech pt ON p.id = pt.project_id 
      LEFT JOIN tech t ON pt.tech_id = t.id 
      GROUP BY p.id 
      ORDER BY p.id DESC;
    `;
    const result = await db.query(query);

    res.render("my-project", {
      projects: result.rows,
    });
  } catch (error) {
    console.error("Error saat mengambil data projects:", error.message);
    res.redirect("my-project");
  }
}
// arrow function
export const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectId = parseInt(id);

    const query = `
      SELECT 
        p.*, 
        COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tech 
      FROM projects p 
      LEFT JOIN project_tech pt ON p.id = pt.project_id 
      LEFT JOIN tech t ON pt.tech_id = t.id 
      WHERE p.id = $1
      GROUP BY p.id;
`;
    const result = await db.query(query, [projectId]);
    const project = result.rows[0]; // ambil data spesifiknya

    if (!project) {
      return res.status(404).send("project tidak di temukan");
    }
    res.render("project-detail", {
      title: "Detail project",
      project,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error ambil data");
  }
};

export const getAddProject = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tech");

    res.render("add-project", {
      technologies: result.rows,
    });
  } catch (error) {
    console.log(error);
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, deskripsi, image, link, tech } = req.body;

    // karna kita itu pakai many to many, jadinya harus ada pengecekan buat tech nya ..
    // Kalau tech cuma string, ubah jadi array. Kalau kosong, jadikan array kosong
    const techArray = Array.isArray(tech) ? tech : tech ? [tech] : [];
    if (!title || title.trim() === "" || !deskripsi || deskripsi.trim() === "") {
      req.session.flash = {
        type: "danger",
        message: "title dan desk nya jangan kosong",
      };
      return res.redirect("/add-project");
    }

    const query = "insert into projects(title, deskripsi, image, link, user_id) values ($1, $2, $3, $4, $5) returning *";
    // anggap si user_id 1 yang bikin project
    const values = [title, deskripsi, image, link, 1];
    const result = await db.query(query, values);

    const newProjectId = result.rows[0].id; // tangkap id project yang baru gw bikin

    if (techArray.length > 0) {
      for (const techId of techArray) {
        await db.query("insert into project_tech (project_id, tech_id) values ($1, $2)", [newProjectId, parseInt(techId)]);
      }
    }

    req.session.flash = {
      type: "success",
      message: "project berhasil di tambahkan",
    };

    console.log("project terbuat", result.rows[0]);
    res.redirect("/my-project");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error ambil data");
  }
};

export const getEditProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectId = parseInt(id);

    const query = "select * from projects where id = $1";
    const result = await db.query(query, [projectId]);
    const project = result.rows[0]; // ambil data spesifiknya

    if (!project) {
      return res.status(404).send("project tidak di temukan");
    }

    const techResult = await db.query("SELECT * FROM tech");
    const allTechs = techResult.rows;

    // ngeliat tech apa aja yang di miliki oleh project yang di pilih
    const projectTechResult = await db.query("SELECT tech_id FROM project_tech WHERE project_id = $1", [projectId]);

    const selectedTechIds = projectTechResult.rows.map((row) => row.tech_id);
    // Logika isChecked sekarang membandingkan ID
    const formattedTechnologies = allTechs.map((t) => {
      return {
        ...t,
        // bisa pakai ini
        //       id: t.id,
        //  name: t.name,
        isChecked: selectedTechIds.includes(t.id), // hasilkan true atau false
      };
    });

    res.render("edit-project", {
      title: "Edit Project",
      project,
      technologies: formattedTechnologies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error ambil data");
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    const { title, deskripsi, image, link, tech } = req.body;

    const techArray = Array.isArray(tech) ? tech : tech ? [tech] : [];
    if (!title || title.trim() === "" || !deskripsi || deskripsi.trim() === "") {
      req.session.flash = {
        type: "danger",
        message: "title dan desk nya jangan kosong",
      };
      return res.redirect(`/project-edit/${projectId}`);
    }

    const query = "update projects set title = $1, deskripsi = $2, image = $3, link = $4 where id = $5 returning *";
    const values = [title, deskripsi, image, link, projectId];
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).send("Project tidak ditemukan!");
    }

    // Hapus semua data tech lama milik project ini di junction table
    await db.query("delete from project_tech where project_id = $1", [projectId]);
    // INSERT TECH BARU (Tabel project_tech)
    if (techArray.length > 0) {
      for (const techId of techArray) {
        await db.query("insert into project_tech (project_id, tech_id) VALUES ($1, $2)", [projectId, parseInt(techId)]);
      }
    }

    req.session.flash = {
      type: "success",
      message: "Berhasil update project",
    };
    res.redirect("/my-project");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error update data");
  }
};

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    const query = "delete from projects where id = $1";
    const result = await db.query(query, [projectId]);

    if (result.rowCount === 0) {
      return res.status(404).send("Project tidak ditemukan!");
    }

    req.session.flash = {
      type: "success",
      message: "project berhasil di hapus",
    };

    res.redirect("/my-project");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error ambil data");
  }
}
