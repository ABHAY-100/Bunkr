"use client";

import {
  useInstitutions,
  useDefaultInstitutionUser,
  useUpdateDefaultInstitutionUser,
} from "@/app/api/users/institutions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function InstitutionSelector() {
  const { data: institutions, isLoading } = useInstitutions();
  const { data: defaultInstitutionUser } = useDefaultInstitutionUser();
  const updateDefaultInstitutionUser = useUpdateDefaultInstitutionUser();
  const queryClient = useQueryClient();

  const [selectedInstitution, setSelectedInstitution] = useState<string>("");

  useEffect(() => {
    if (defaultInstitutionUser && !selectedInstitution) {
      setSelectedInstitution(defaultInstitutionUser.toString());
    }
  }, [defaultInstitutionUser, selectedInstitution]);

  useEffect(() => {
    // Reset selected institution when default changes
    if (defaultInstitutionUser) {
      setSelectedInstitution(defaultInstitutionUser.toString());
    }
  }, [defaultInstitutionUser]);

  const handleSaveInstitution = () => {
    if (!selectedInstitution) return;

    updateDefaultInstitutionUser.mutate(Number.parseInt(selectedInstitution), {
      onSuccess: () => {
        // Invalidate both queries to ensure sync
        queryClient.invalidateQueries({ queryKey: ["defaultInstitutionUser"] });
        queryClient.invalidateQueries({ queryKey: ["institutions"] });
        toast("Institution updated", {
          description: "Your default institution has been updated.",
        });
      },
      onError: () => {
        // Reset on error
        setSelectedInstitution(defaultInstitutionUser?.toString() || "");
        toast.error("Error", {
          description: "Failed to update institution. Please try again.",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Institutions</CardTitle>
          <CardDescription>Select your default institution</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-fit w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!institutions || institutions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Institutions</CardTitle>
          <CardDescription>
            You are not enrolled in any institutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Contact your administrator to get enrolled in an institution.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="mt-3">
        <CardTitle>Institutions</CardTitle>
        <CardDescription className="hidden md:block">
          Select your default institution
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <RadioGroup
          value={selectedInstitution}
          onValueChange={setSelectedInstitution}
          className="space-y-1"
        >
          {institutions.map((institution) => (
            <div
              key={institution.id}
              className={`flex items-center space-x-2 rounded-md border p-2 md:p-3 ${
                selectedInstitution === institution.id.toString()
                  ? "border-primary bg-primary/5"
                  : "border-input"
              }`}
            >
              <label
                htmlFor={`institution-${institution.id}`}
                className="flex flex-1 items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {institution.institution.name}
                    </p>
                    <p className="text-xs text-muted-foreground hidden md:block">
                      Role:{" "}
                      <span className="capitalize">
                        {institution.institution_role.name}
                      </span>
                    </p>
                  </div>
                </div>
              </label>
              <RadioGroupItem
                value={institution.id.toString()}
                id={`institution-${institution.id}`}
              />
            </div>
          ))}
        </RadioGroup>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSaveInstitution}
            disabled={
              updateDefaultInstitutionUser.isPending ||
              selectedInstitution === defaultInstitutionUser?.toString()
            }
            className="w-full md:w-auto"
          >
            {updateDefaultInstitutionUser.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save as Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
