import YAML from "yaml";
import fs from "fs";
import path from "path";

export function skillHandler(userPrompt) {
    const skills = loadSkills();
    const systemPrompt = buildSystemPrompt(skills);
    const resolvedPrompt = resolvePrompt(userPrompt, skills);
    return { systemPrompt, resolvedPrompt };
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
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
        if (!match) continue;

        //parse it to add it to the skills
        const meta = YAML.parse(match[1]) ?? {};
        skills.push({
            name: meta.name ?? entry.name,
            description: meta.description ?? "",
            body: match[2].trim(),
        });
    }
    return skills;
}

function buildSystemPrompt(skills) {
    const list = skills.map((s) => `- ${s.name}: ${s.description}`).join("\n");
    return `You have access to the following skills:\n\n${list}`;
}

function resolvePrompt(prompt, skills) {
    if (!prompt.startsWith("/")) return prompt;

    const [cmd, ...positional] = prompt.slice(1).split(/\s+/);
    const skill = skills.find((s) => s.name === cmd);
    if (!skill) return prompt;

    const args = positional.join(" ");
    // check if body uses $ARGUMENTS placeholder
    const hasPlaceholder = /\$ARGUMENTS|\$\d+/.test(skill.body);
    if (!hasPlaceholder) {
        return args ? `${skill.body}\n\nARGUMENTS: ${args}` : skill.body;
    }

    // if there are $ARGUMENTS -> i replace them in positional order
    return skill.body.replace(/\$ARGUMENTS|\$(\d+)/g, (_match, index) =>
        index === undefined ? args : (positional[Number(index)] ?? "")
    );
}