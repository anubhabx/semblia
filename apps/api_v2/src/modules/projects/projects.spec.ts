import { describe, expect, it } from "vitest";
import { RequestMethod } from "@nestjs/common";
import { ProjectsController } from "./projects.controller.js";

const PATH_METADATA = "path";
const METHOD_METADATA = "method";

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
});
