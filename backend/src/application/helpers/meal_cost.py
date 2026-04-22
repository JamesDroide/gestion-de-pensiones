from decimal import Decimal
from typing import Optional


def calc_meal_cost(
    breakfast: int,
    lunch: int,
    dinner: int,
    extras_total: Decimal,
    no_pension_rules: bool,
    no_pension_price_mode: str,
    menu_price: Decimal,
    menu_price_normal: Decimal,
    menu_price_2_meals: Decimal,
    menu_price_3_meals: Decimal,
    custom_price_1_meal: Optional[Decimal] = None,
    custom_price_2_meals: Optional[Decimal] = None,
    custom_price_3_meals: Optional[Decimal] = None,
    custom_breakfast_price: Optional[Decimal] = None,
    custom_lunch_price: Optional[Decimal] = None,
    custom_dinner_price: Optional[Decimal] = None,
) -> Decimal:
    meal_count = breakfast + lunch + dinner
    # unique_meals: número de tipos de comida distintos consumidos (0-3)
    unique_meals = sum(1 for m in [breakfast, lunch, dinner] if m > 0)

    if not no_pension_rules:
        if meal_count == 0:
            base = Decimal("0")
        elif meal_count == 1:
            base = menu_price_normal
        elif meal_count == 2:
            base = menu_price_2_meals * 2
        else:
            base = menu_price_3_meals * 3
        return base + extras_total

    if no_pension_price_mode == "custom_tiered":
        # El precio escalonado se basa en cuántos TIPOS de comida distintos se consumen
        if unique_meals == 0:
            base = Decimal("0")
        elif unique_meals == 1:
            base = custom_price_1_meal or Decimal("0")
        elif unique_meals == 2:
            base = (custom_price_2_meals or Decimal("0")) * 2
        else:
            base = (custom_price_3_meals or Decimal("0")) * 3
    elif no_pension_price_mode == "custom_by_type":
        base = (
            (custom_breakfast_price or Decimal("0")) * breakfast
            + (custom_lunch_price or Decimal("0")) * lunch
            + (custom_dinner_price or Decimal("0")) * dinner
        )
    else:  # menu_price (default)
        base = menu_price * meal_count

    return base + extras_total
