/**
 * Guest Management Page
 *
 * Manages hotel guests with CRUD operations.
 */

import { Users, Plus } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  SearchAndFilterBar,
  Button,
  EmptyState,
  CRUDModalContainer,
} from "../../components/common";
import { useHotel } from "../../contexts/HotelContext";
import {
  useGuests,
  guestKeys,
} from "../../hooks/queries/hotel-management/guests";
import { useTableSubscription } from "../../hooks/useTableSubscription";
import { useGuestCRUD } from "./hooks";
import { GuestsDataView, GUEST_FORM_FIELDS } from "./components";

export const GuestManagementPage = () => {
  const { currentHotel } = useHotel();

  // Query hooks
  const { data: guests = [], isLoading } = useGuests(currentHotel?.id || "");

  // Real-time subscription for guests
  useTableSubscription({
    table: "guests",
    filter: `hotel_id=eq.${currentHotel?.id}`,
    queryKey: guestKeys.list({ hotelId: currentHotel?.id || "" }),
  });

  // CRUD hook
  const guestCRUD = useGuestCRUD({
    initialGuests: guests,
    formFields: GUEST_FORM_FIELDS,
  });

  const {
    searchAndFilter,
    modalState,
    modalActions,
    formState,
    formActions,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
  } = guestCRUD;

  return (
    <PageContainer>
      <PageHeader
        title="Guest Management"
        subtitle="Manage hotel guests and their information"
      />

      <div className="space-y-4">
        <SearchAndFilterBar
          searchQuery={searchAndFilter.searchTerm}
          onSearchChange={searchAndFilter.setSearchTerm}
          searchPlaceholder="Search guests by name, email, or room..."
          filterActive={Boolean(searchAndFilter.filterValue)}
          onFilterToggle={() =>
            searchAndFilter.setFilterValue(
              searchAndFilter.filterValue ? "" : "active"
            )
          }
          viewMode={searchAndFilter.mode}
          onViewModeChange={searchAndFilter.setViewMode}
          rightActions={
            <Button
              variant="dark"
              leftIcon={Plus}
              onClick={modalActions.openCreateModal}
            >
              ADD GUEST
            </Button>
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            Loading guests...
          </div>
        ) : searchAndFilter.filteredData.length > 0 ? (
          <>
            <div className="mb-2 text-sm text-gray-500">
              Found {searchAndFilter.filteredData.length} guest(s)
            </div>
            <GuestsDataView
              viewMode={searchAndFilter.mode}
              filteredData={searchAndFilter.filteredData}
              handleRowClick={modalActions.openDetailModal}
              onEdit={modalActions.openEditModal}
              onDelete={modalActions.openDeleteModal}
            />
          </>
        ) : (
          <EmptyState
            message="No guests found. Add your first guest to get started!"
            icon={Users}
          />
        )}
      </div>

      {/* CRUD Modals */}
      <CRUDModalContainer
        modalState={modalState}
        modalActions={modalActions}
        formState={formState}
        formActions={formActions}
        formFields={GUEST_FORM_FIELDS}
        onCreateSubmit={handleCreateSubmit}
        onEditSubmit={handleEditSubmit}
        onDeleteConfirm={handleDeleteConfirm}
        entityName="Guest"
      />
    </PageContainer>
  );
};
