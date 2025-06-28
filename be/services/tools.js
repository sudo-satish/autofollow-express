const { TavilySearch } = require("@langchain/tavily");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const Followup = require("../models/followup");
const moment = require("moment-timezone");

const getRealtimeDateTime = tool(async ({ timezone }) => {
    return {
        success: true,
        message: 'Realtime date and time fetched successfully',
        data: {
            date: moment().tz(timezone).format('YYYY-MM-DD'),
            time: moment().tz(timezone).format('HH:mm:ss'),
            timezone: moment().tz(timezone).format('z'),
        },
    };
}, {
    name: "get_realtime_date_time",
    description: "Call to get the current date and time.",
    schema: z.object({
        timezone: z.string().describe("Timezone to get the date and time for."),
    }),
});

const multiply = tool((input) => {
    return input.a * input.b;
}, {
    name: "multiply",
    description: "Call to multiply two numbers.",
    schema: z.object({
        a: z.number().describe("First number to multiply."),
        b: z.number().describe("Second number to multiply."),
    }),
});

const humanAssistanceNeeded = tool(async (input) => {
    console.log({
        name: 'Human Assistance',
        reason: input.reason,
    });

    const followup = await Followup.findById(input.followup_id);
    if (!followup) {
        throw new Error('Followup not found');
    }

    // followup.isAutoMode = false;
    // await followup.save();

    return {
        success: true,
        message: 'Human assistance requested',
    };
}, {
    name: "human_assistance_needed",
    description: 'Request human assistance.',
    schema: z.object({
        reason: z.string(),
        followup_id: z.string(),
    }),
});

const giggerAttendanceConfirmation = tool(async ({ gigger_id, booking_id, gigger_will_check_in, followup_id, reason }) => {
    console.log({
        followup_id,
        gigger_id,
        booking_id,
        gigger_will_check_in,
        reason,
    });

    const followup = await Followup.findById(followup_id);
    if (!followup) {
        throw new Error('Followup not found');
    }

    // Lets call a webhook to the gigger api
    // [PATCH] {{JOBS-URL}}/api/mobile/gigs/bookings/:bookingId/webhook

    const giggerWebhookUrl = `http://localhost:5004/api/mobile/gigs/bookings/${booking_id}/webhook`;
    await fetch(giggerWebhookUrl, {
        method: 'POST',
        headers: {
            'User-Agent': 'undici-stream-example',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            gigger_will_check_in,
            reason,
        }),
    });

    // followup.isAutoMode = false;
    // await followup.save();

    return {
        success: true,
        message: 'Attendance confirmed',
    };
}, {
    name: "gigger_attendance_confirmation",
    description: 'Confirm attendance for a given shift in the DB.',
    schema: z.object({
        gigger_id: z.string(),
        booking_id: z.string(),
        followup_id: z.string(),
        gigger_will_check_in: z.string(),
        reason: z.string(),
    }),
});

const tools = [
    giggerAttendanceConfirmation,
    humanAssistanceNeeded,
    multiply,
    getRealtimeDateTime,
    new TavilySearch(
        {
            maxResults: 5,
            topic: 'general',
        }
    ),
];


module.exports = {
    tools
}