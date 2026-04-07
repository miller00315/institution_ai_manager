import type { BNCCItem } from '../types';

export function bnccCurriculumName(bncc?: BNCCItem | null): string {
    return bncc?.curriculum_component?.name?.trim() || '';
}

export function bnccDisciplineRefName(bncc?: BNCCItem | null): string {
    return bncc?.discipline_reference?.name?.trim() || '';
}

export function bnccTeachingStageName(bncc?: BNCCItem | null): string {
    return bncc?.teaching_stage?.name?.trim() || '';
}

export function bnccHabilityName(bncc?: BNCCItem | null): string {
    return bncc?.specific_skills?.habilities?.name?.trim() || '';
}

/** Descrição da habilidade (`specific_skills`) ou seu nome. */
export function bnccSkillPrimaryText(bncc?: BNCCItem | null): string {
    const ss = bncc?.specific_skills;
    if (!ss) return '';
    const desc = ss.description?.trim();
    if (desc) return desc;
    return ss.name?.trim() || '';
}

export function bnccSearchHaystack(bncc: BNCCItem): string {
    const parts = [
        bncc.codigo_alfanumerico,
        bnccCurriculumName(bncc),
        bnccDisciplineRefName(bncc),
        bnccTeachingStageName(bncc),
        bnccHabilityName(bncc),
        bnccSkillPrimaryText(bncc),
        bncc.specific_skills?.name,
        bncc.curriculum_component?.description,
        bncc.discipline_reference?.description,
        bncc.teaching_stage?.description,
        bncc.specific_skills?.habilities?.description,
    ];
    return parts.filter(Boolean).join(' ').toLowerCase();
}

/** Campos traduzíveis para exibição em modal / painel. */
export type BNCCDetailField =
    | 'code'
    | 'curriculum'
    | 'curriculumDescription'
    | 'disciplineRef'
    | 'disciplineRefDescription'
    | 'teachingStage'
    | 'teachingStageDescription'
    | 'hability'
    | 'habilityDescription'
    | 'specificSkill'
    | 'specificSkillDescription';

export interface BNCCDetailRow {
    field: BNCCDetailField;
    value: string;
}

export function bnccDetailRows(bncc: BNCCItem): BNCCDetailRow[] {
    const rows: BNCCDetailRow[] = [{ field: 'code', value: bncc.codigo_alfanumerico || '—' }];

    const cc = bncc.curriculum_component;
    if (cc || bncc.curriculum_component_id) {
        rows.push({ field: 'curriculum', value: cc?.name?.trim() || '—' });
        const ccd = cc?.description?.trim();
        if (ccd) rows.push({ field: 'curriculumDescription', value: ccd });
    }

    const dr = bncc.discipline_reference;
    if (dr || bncc.discipline_reference_id) {
        rows.push({ field: 'disciplineRef', value: dr?.name?.trim() || '—' });
        const drd = dr?.description?.trim();
        if (drd) rows.push({ field: 'disciplineRefDescription', value: drd });
    }

    const ts = bncc.teaching_stage;
    if (ts || bncc.teaching_stage_id) {
        rows.push({ field: 'teachingStage', value: ts?.name?.trim() || '—' });
        const tsd = ts?.description?.trim();
        if (tsd) rows.push({ field: 'teachingStageDescription', value: tsd });
    }

    const ss = bncc.specific_skills;
    const hab = ss?.habilities;
    if (hab || ss?.hability_id) {
        rows.push({ field: 'hability', value: hab?.name?.trim() || '—' });
        const hd = hab?.description?.trim();
        if (hd) rows.push({ field: 'habilityDescription', value: hd });
    }

    if (ss || bncc.specific_skills_id) {
        rows.push({ field: 'specificSkill', value: ss?.name?.trim() || '—' });
        const ssd = ss?.description?.trim();
        if (ssd) rows.push({ field: 'specificSkillDescription', value: ssd });
    }

    return rows;
}

/** Linhas legadas (rótulos fixos em PT-BR); prefira `bnccDetailRows` + i18n na UI. */
export function bnccDetailsLines(bncc: BNCCItem): string[] {
    const label: Record<BNCCDetailField, string> = {
        code: 'Código',
        curriculum: 'Componente curricular',
        curriculumDescription: 'Descrição do componente curricular',
        disciplineRef: 'Disciplina',
        disciplineRefDescription: 'Descrição da disciplina',
        teachingStage: 'Etapa de ensino',
        teachingStageDescription: 'Descrição da etapa de ensino',
        hability: 'Competência específica',
        habilityDescription: 'Descrição da competência específica',
        specificSkill: 'Habilidade',
        specificSkillDescription: 'Descrição da habilidade',
    };
    return [
        'Detalhes da BNCC',
        '────────────────────────────',
        ...bnccDetailRows(bncc).map((r) => `${label[r.field]}: ${r.value}`),
    ];
}

export function bnccSelectSecondary(bncc: BNCCItem, maxLen = 40): string {
    const primary =
        bnccSkillPrimaryText(bncc) || bnccCurriculumName(bncc) || bnccDisciplineRefName(bncc) || '';
    if (!primary) return '';
    return primary.length > maxLen ? primary.slice(0, maxLen) + '…' : primary;
}
