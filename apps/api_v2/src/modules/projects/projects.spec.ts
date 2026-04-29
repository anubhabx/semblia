import { describe, expect, it } from "vitest";
import { RequestMethod } from "@nestjs/common";
import { ProjectsController } from "./projects.controller.js";
import { Capability } from "../../common/authz/capabilities.js";
import { CapabilityGuard } from "../../common/authz/capability.guard.js";
import { REQUIRED_CAPABILITIES_KEY } from "../../common/authz/require-capability.decorator.js";

const PATH_METADATA = "path";
const METHOD_METADATA = "method";
const GUARDS_METADATA = "__guards__";

describe("ProjectsController", () => {
  it("is defined", () => {
    expect(ProjectsController).toBeDefined();
  });

  it("declares GET /projects", () => {
    expect(Reflect.getMetadata(PATH_METADATA, ProjectsController)).toBe(
      "projects",
    );
    expect(
      Reflect.getMetadata(PATH_METADATA, ProjectsController.prototype.list),
    ).toBe("/");
    expect(
      Reflect.getMetadata(METHOD_METADATA, ProjectsController.prototype.list),
    ).toBe(RequestMethod.GET);
  });

  it("declares project CRUD routes", () => {
    expect(
      Reflect.getMetadata(PATH_METADATA, ProjectsController.prototype.create),
    ).toBe("/");
    expect(
      Reflect.getMetadata(METHOD_METADATA, ProjectsController.prototype.create),
    ).toBe(RequestMethod.POST);

    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProjectsController.prototype.getBySlug,
      ),
    ).toBe(":slug");
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProjectsController.prototype.getBySlug,
      ),
    ).toBe(RequestMethod.GET);

    expect(
      Reflect.getMetadata(PATH_METADATA, ProjectsController.prototype.update),
    ).toBe(":slug");
    expect(
      Reflect.getMetadata(METHOD_METADATA, ProjectsController.prototype.update),
    ).toBe(RequestMethod.PATCH);

    expect(
      Reflect.getMetadata(PATH_METADATA, ProjectsController.prototype.delete),
    ).toBe(":slug");
    expect(
      Reflect.getMetadata(METHOD_METADATA, ProjectsController.prototype.delete),
    ).toBe(RequestMethod.DELETE);
  });

  it("declares allowed-origin routes", () => {
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProjectsController.prototype.listAllowedOrigins,
      ),
    ).toBe(":slug/allowed-origins");
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProjectsController.prototype.listAllowedOrigins,
      ),
    ).toBe(RequestMethod.GET);

    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProjectsController.prototype.replaceAllowedOrigins,
      ),
    ).toBe(":slug/allowed-origins");
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProjectsController.prototype.replaceAllowedOrigins,
      ),
    ).toBe(RequestMethod.PUT);
  });

  it("declares signing-secret routes", () => {
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProjectsController.prototype.generateSigningSecret,
      ),
    ).toBe(":slug/signing-secret");
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProjectsController.prototype.generateSigningSecret,
      ),
    ).toBe(RequestMethod.POST);

    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProjectsController.prototype.clearSigningSecret,
      ),
    ).toBe(":slug/signing-secret");
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProjectsController.prototype.clearSigningSecret,
      ),
    ).toBe(RequestMethod.DELETE);
  });

  it("declares member list and add routes", () => {
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProjectsController.prototype.listMembers,
      ),
    ).toBe(":slug/members");
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProjectsController.prototype.listMembers,
      ),
    ).toBe(RequestMethod.GET);

    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProjectsController.prototype.addMember,
      ),
    ).toBe(":slug/members");
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProjectsController.prototype.addMember,
      ),
    ).toBe(RequestMethod.POST);
  });

  it("declares member update and delete routes", () => {
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProjectsController.prototype.updateMember,
      ),
    ).toBe(":slug/members/:userId");
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProjectsController.prototype.updateMember,
      ),
    ).toBe(RequestMethod.PATCH);

    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProjectsController.prototype.removeMember,
      ),
    ).toBe(":slug/members/:userId");
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProjectsController.prototype.removeMember,
      ),
    ).toBe(RequestMethod.DELETE);
  });

  it("applies capability guard metadata to protected routes", () => {
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        ProjectsController.prototype.getBySlug,
      ),
    ).toEqual([CapabilityGuard]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectsController.prototype.getBySlug,
      ),
    ).toEqual([Capability.VIEW_PROJECT]);

    expect(
      Reflect.getMetadata(GUARDS_METADATA, ProjectsController.prototype.update),
    ).toEqual([CapabilityGuard]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectsController.prototype.update,
      ),
    ).toEqual([Capability.MANAGE_PROJECT]);

    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectsController.prototype.listMembers,
      ),
    ).toEqual([Capability.VIEW_PROJECT]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectsController.prototype.addMember,
      ),
    ).toEqual([Capability.MANAGE_MEMBERS]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectsController.prototype.updateMember,
      ),
    ).toEqual([Capability.MANAGE_MEMBERS]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectsController.prototype.removeMember,
      ),
    ).toEqual([Capability.MANAGE_MEMBERS]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectsController.prototype.listAllowedOrigins,
      ),
    ).toEqual([Capability.MANAGE_PROJECT]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectsController.prototype.replaceAllowedOrigins,
      ),
    ).toEqual([Capability.MANAGE_PROJECT]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectsController.prototype.generateSigningSecret,
      ),
    ).toEqual([Capability.MANAGE_PROJECT]);
    expect(
      Reflect.getMetadata(
        REQUIRED_CAPABILITIES_KEY,
        ProjectsController.prototype.clearSigningSecret,
      ),
    ).toEqual([Capability.MANAGE_PROJECT]);
  });
});
