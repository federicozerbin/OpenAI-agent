import YAML from "yaml";
import fs from "fs";
import path from "path";

export function skillHandler(){
    let array = loadSkills();
    buildSystemPrompt();
    return array;
}

//loads skills into array
function loadSkills() {
    const skillsDir = path.join(process.cwd(), ".claude", "skills");
    if (!fs.existsSync(skillsDir)) return [];

    //Scan .claude/skills/, run through the skill folders and parse the frontmatter to read the name and description out of each SKILL.md,
    // and add them to your system prompt. Do not include the bodies.
    const skills = [];

    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;

        const file = path.join(skillsDir, entry.name, "SKILL.md");
        if (!fs.existsSync(file)) continue;

        const content = fs.readFileSync(file, "utf8");
        // check if contains frontmatter between "---" and extract it
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!match) continue;

        //parse it to add it to the skills
        const meta = YAML.parse(match[1]) ?? {};
        skills.push({
            name: meta.name ?? entry.name,
            description: meta.description ?? "",
        });
    }
    return skills;
}

function buildSystemPrompt(skills) {
    const list = skills.map((s) => `- ${s.name}: ${s.description}`).join("\n");
    return `You have access to the following skills:\n\n${list}`;
}