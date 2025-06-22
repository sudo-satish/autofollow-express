const { createClerkClient } = require('@clerk/clerk-sdk-node');

const createOrganisation = async ({ name }) => {
    const client = await createClerkClient({
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
    });
    const organisation = await client.organizations.createOrganization({
        name,
    });
    return organisation;
};


const createOrganisationMembership = async (
    clerkId,
    {
        organizationId,
        role,
    }
) => {
    const client = await createClerkClient({
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
    });
    const membership = await client.organizations.createOrganizationMembership({
        organizationId,
        userId: clerkId,
        role,
    });
    return membership;
};


const createUser = async ({ email, password, firstName, lastName, organizationId }) => {
    const client = await createClerkClient({
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
    });

    const user = await client.users.createUser({
        emailAddress: [email],
        password,
        firstName,
        lastName,
        organizationMemberships: organizationId ? [{ organization: organizationId }] : undefined,
    });

    await createOrganisationMembership(user.id, {
        organizationId: organizationId,
        role: 'org:admin',
    });

    return user;
};

module.exports = {
    createOrganisation,
    createUser,
};