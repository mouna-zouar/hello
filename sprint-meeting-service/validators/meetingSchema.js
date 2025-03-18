const { z } = require('zod');

const sprintMeetingSchema = z.object({
    sprintId: z.number().int().positive(),
    meetingDate: z.string().min(1),
    agenda: z.string().min(1),
    participants: z.array(z.string()),
    taskId: z.number().int().positive(),
    projectId: z.number().int().positive(),
    onlineMeetingLink: z.string().optional(),
    status: z.string().optional(),
});

module.exports = sprintMeetingSchema;
